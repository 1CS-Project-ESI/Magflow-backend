// pdfBonCommandeController.js

import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import htmlPdf from 'html-pdf';

import { BonCommandeInterne, ProduitsCommandeInterne , BonSortie, ProduitsServie , BonCommande,ProduitsCommandes , BonReception , ProduitsDelivres , BonDecharge , ProduitsDecharges} from '../models/bonsModel.js';
import { Consumer, User ,AgentServiceAchat , Magasinier} from '../models/usersModel.js';
import { Fournisseur } from '../models/fournisseurModel.js';
import { Structure } from '../models/structuresModel.js';
import { EtatStock, Inventaire } from '../models/inventaireModel.js';
import { Produit,Article,Chapitre } from '../models/productsModel.js';

const generatePDF = async (req, res) => {
    try {
        const { bonCommandeInterneId } = req.params;

        // Fetch boncommandeinterne details
        const bonCommandeInterne = await BonCommandeInterne.findByPk(bonCommandeInterneId);

        // Fetch the associated consumer
        const consumer = await Consumer.findByPk(bonCommandeInterne.id_consommateur);

        // Fetch the associated user details
        const user = await User.findByPk(bonCommandeInterne.id_consommateur);

        // Fetch the associated structure
        const structure = await Structure.findByPk(consumer.id_structure);

        // Fetch produitscommandeinterne associated with boncommandeinterne
        const produitsCommandeInterne = await ProduitsCommandeInterne.findAll({
            where: { id_boncommandeinterne: bonCommandeInterneId },
            attributes: ['orderedquantity', 'accordedquantity', 'id_produit']
        });

        // Fetch product details separately for each produit
        const productDetails = await Promise.all(produitsCommandeInterne.map(async (produitCommandeInterne) => {
            // Fetch the associated product details
            const produit = await Produit.findByPk(produitCommandeInterne.id_produit, { attributes: ['name', 'caracteristics'] });
            return {
                produitName: produit.name,
                caracteristics: produit.caracteristics,
                ...produitCommandeInterne.toJSON()
            };
        }));

        // Render HTML template with EJS
        const templatePath = path.resolve(fileURLToPath(import.meta.url), '../template.ejs');
        const htmlContent = await ejs.renderFile(templatePath, {
            bonCommandeInterne,
            user,
            structure,
            productDetails
        });

        // Define PDF options
        const options = { format: 'Letter' };

        // Generate PDF in-memory
        htmlPdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Failed to generate PDF:', err);
                return res.status(500).json({ error: 'Failed to generate PDF' });
            }

            // Send the PDF as a response to prompt download
            res.setHeader('Content-Disposition', `attachment; filename=boncommande_${bonCommandeInterneId}.pdf`);
            res.setHeader('Content-Type', 'application/pdf');
            res.send(buffer);
        });
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        return res.status(500).json({ error: 'Failed to generate PDF' });
    }
};



const generateBonSortiePDF = async (req, res) => {
    try {
        const { bonSortieId } = req.params;

        // Fetch Bon de Sortie details
        const bonSortie = await BonSortie.findByPk(bonSortieId);
        if (!bonSortie) {
            throw new Error('Bon de Sortie not found');
        }

        // Fetch Bon de Commande Interne details
        const bonCommandeInterne = await BonCommandeInterne.findByPk(bonSortie.id_boncommandeinterne);
        if (!bonCommandeInterne) {
            throw new Error('Bon de Commande Interne not found');
        }

        // Fetch Consumer details
        const consumer = await Consumer.findByPk(bonCommandeInterne.id_consommateur);
        if (!consumer) {
            throw new Error('Consumer not found');
        }

        // Fetch User details for Consumer's first and last name
        const user = await User.findByPk(consumer.user_id);
        if (!user) {
            throw new Error('User not found for Consumer');
        }

        // Fetch Structure details for the Consumer
        const structure = await Structure.findByPk(consumer.id_structure);
        if (!structure) {
            throw new Error('Structure not found');
        }

        // Fetch details of served products
        const produitsServis = await ProduitsServie.findAll({
            where: { id_bonsortie: bonSortieId }
        });
        if (!produitsServis || produitsServis.length === 0) {
            throw new Error('Produits Servis not found');
        }

        // Fetch ordered quantity from ProduitsCommandeInterne
        const produitsCommandeInterne = await ProduitsCommandeInterne.findAll({
            where: { id_boncommandeinterne: bonCommandeInterne.id },
            attributes: ['id_produit', 'orderedquantity']
        });

        // Map ordered quantity to produitsServis
        // Map details of served products
        const produitsDetails = await Promise.all(produitsServis.map(async (produitServi) => {
            const produit = await Produit.findByPk(produitServi.id_produit);
            const orderedQuantity = produitsCommandeInterne.find(item => item.id_produit === produitServi.id_produit)?.orderedquantity || 'N/A';
            return {
                produitName: produit ? produit.name : 'N/A',
                caracteristics: produit ? produit.caracteristics : 'N/A',
                orderedquantity: orderedQuantity,
                servedquantity: produitServi.servedquantity
            };
        }));

        // Render HTML template with EJS
        const templatePath = path.resolve(fileURLToPath(import.meta.url), '../bonSortieTemplate.ejs');
        const htmlContent = await ejs.renderFile(templatePath, {
            bonSortie,
            bonCommandeInterne,
            consumer,
            user,
            structure,
            produitsDetails
        });

        // Define PDF options
        const options = { format: 'A4' };

        // Generate PDF
        htmlPdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Failed to generate Bon de Sortie PDF:', err);
                return res.status(500).json({ error: 'Failed to generate Bon de Sortie PDF' });
            }
            // Set Content-Disposition header to prompt the browser to download the file
            res.setHeader('Content-Disposition', 'attachment; filename=bonSortie.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            // Send the PDF buffer as the response
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error generating Bon de Sortie PDF:', error);
        return res.status(500).json({ error: error.message });
    }
};

const generateBonCommandePDF = async (req, res) => {
    try {
        const { bonCommandeId } = req.params;

        // Fetch Bon de Commande details
        const bonCommande = await BonCommande.findByPk(bonCommandeId);
        if (!bonCommande) {
            throw new Error('Bon de Commande not found');
        }

        // Fetch Agent Service Achat details
        const agentServiceAchat = await AgentServiceAchat.findByPk(bonCommande.id_agentserviceachat);
        if (!agentServiceAchat) {
            throw new Error('Agent Service Achat not found');
        }

        const user = await User.findByPk(agentServiceAchat.user_id);

        if(!user){
            throw new Error('user not found');
        }
        // Fetch Fournisseur details
        const fournisseur = await Fournisseur.findByPk(bonCommande.id_fournisseur);
        if (!fournisseur) {
            throw new Error('Fournisseur not found');
        }

        // Fetch Products details
        const produitsCommandes = await ProduitsCommandes.findAll({
            where: { id_boncommande: bonCommandeId }
        });
        if (!produitsCommandes || produitsCommandes.length === 0) {
            throw new Error('Produits Commandes not found');
        }

        // Prepare products details
        const produitsDetails = await Promise.all(produitsCommandes.map(async (produitCommande) => {
            const produit = await Produit.findByPk(produitCommande.id_produit);
            if (!produit) {
                throw new Error('Produit not found');
            }
            return {
                produitName: produit.name || 'N/A',
                caracteristics: produit.caracteristics || 'N/A',
                orderedquantity: produitCommande.ordered_quantity,
                unitPrice: produitCommande.price,
                totalPrice: produitCommande.price * produitCommande.ordered_quantity
            };
        }));

        // Render HTML template with EJS
        const templatePath = path.resolve(fileURLToPath(import.meta.url), '../bonCommandeTemplate.ejs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = ejs.render(templateContent, {
            bonCommande,
            agentServiceAchat,
            user,
            fournisseur,
            produitsDetails
        });

        // Define PDF options
        const pdfOptions = { format: 'A4' };

        // Generate PDF
        htmlPdf.create(htmlContent, pdfOptions).toBuffer((err, buffer) => {
            if (err) {
                console.error('Failed to generate Bon de Commande PDF:', err);
                return res.status(500).json({ error: 'Failed to generate Bon de Commande PDF' });
            }
            // Set Content-Disposition header to prompt the browser to download the file
            res.setHeader('Content-Disposition', 'attachment; filename=bonCommande.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            // Send the PDF buffer as the response
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error generating Bon de Commande PDF:', error);
        return res.status(500).json({ error: error.message });
    }
};


const generateBonReceptionPDF = async (req, res) => {
    try {
        const { bonReceptionId } = req.params;

        // Fetch Bon Reception details
        const bonReception = await BonReception.findByPk(bonReceptionId);
        if (!bonReception) {
            throw new Error('Bon Reception not found');
        }

        // Fetch Bon Commande details using Bon Reception's reference
        const bonCommande = await BonCommande.findByPk(bonReception.id_boncommande);
        if (!bonCommande) {
            throw new Error('Bon Commande not found for Bon Reception');
        }

        // Fetch Fournisseur details using Bon Commande's reference
        const fournisseur = await Fournisseur.findByPk(bonCommande.id_fournisseur);
        if (!fournisseur) {
            throw new Error('Fournisseur not found for Bon Commande');
        }

        // Fetch products delivered details
        const produitsDelivres = await ProduitsDelivres.findAll({
            where: { id_bonreception: bonReceptionId }
        });
        if (!produitsDelivres || produitsDelivres.length === 0) {
            throw new Error('No products delivered found');
        }

        // Prepare products details
        const produitsDetails = await Promise.all(produitsDelivres.map(async (produitDelivre) => {
            const produit = await Produit.findByPk(produitDelivre.id_produit);
            return {
                produitName: produit ? produit.name : 'N/A',
                receivedQuantity: produitDelivre.receivedquantity
            };
        }));

        // Render HTML template with EJS
        const templatePath = path.resolve(fileURLToPath(import.meta.url), '../bonReceptionTemplate.ejs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = ejs.render(templateContent, {
            bonCommandeDate: bonCommande.orderdate,
            bonReceptionDate: bonReception.deliverydate,
            bonReceptionNumber: bonReception.number,
            bonCommandeNumber: bonCommande.number,
            fournisseurName: fournisseur.name,
            produitsDetails
        });

        // Define PDF options
        const pdfOptions = { format: 'A4' };

        // Generate PDF
        htmlPdf.create(htmlContent, pdfOptions).toBuffer((err, buffer) => {
            if (err) {
                console.error('Failed to generate Bon Reception PDF:', err);
                return res.status(500).json({ error: 'Failed to generate Bon Reception PDF' });
            }
            // Set Content-Disposition header to prompt the browser to download the file
            res.setHeader('Content-Disposition', 'attachment; filename=bonReception.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            // Send the PDF buffer as the response
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error generating Bon Reception PDF:', error);
        return res.status(500).json({ error: error.message });
    }
};
const generateBonDechargePDF = async (req, res) => {
    try {
        const { bonDechargeId } = req.params;

        // Fetch Bon de Decharge details
        const bonDecharge = await BonDecharge.findByPk(bonDechargeId);
        if (!bonDecharge) {
            throw new Error('Bon de Decharge not found');
        }

        // Fetch Consommateur details
        const consommateur = await User.findByPk(bonDecharge.id_consommateur);
        if (!consommateur) {
            throw new Error('Consommateur not found');
        }

        // Fetch details of products decharged
        const produitsDecharges = await ProduitsDecharges.findAll({
            where: { id_bondecharge: bonDechargeId }
        });
        if (!produitsDecharges || produitsDecharges.length === 0) {
            throw new Error('Produits Decharges not found');
        }

        // Prepare products details
        const produitsDetails = [];
        for (const produitDecharge of produitsDecharges) {
            const produit = await Produit.findByPk(produitDecharge.id_produit);
            if (!produit) {
                throw new Error(`Produit with ID ${produitDecharge.id_produit} not found`);
            }
            produitsDetails.push({
                produitName: produit.name || 'N/A',
                dechargedquantity: produitDecharge.dechargedquantity,
                observation: produitDecharge.observation || 'N/A'
            });
        }

        // Render HTML template with EJS
        const templatePath = path.resolve(fileURLToPath(import.meta.url), '../bonDechargeTemplate.ejs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = ejs.render(templateContent, {
            bonDecharge,
            consommateur,
            produitsDetails
        });

        // Define PDF options
        const pdfOptions = { format: 'A4' };

        // Generate PDF
        htmlPdf.create(htmlContent, pdfOptions).toBuffer((err, buffer) => {
            if (err) {
                console.error('Failed to generate Bon de Decharge PDF:', err);
                return res.status(500).json({ error: 'Failed to generate Bon de Decharge PDF' });
            }
            // Set Content-Disposition header to prompt the browser to download the file
            res.setHeader('Content-Disposition', 'attachment; filename=bonDecharge.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            // Send the PDF buffer as the response
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error generating Bon de Decharge PDF:', error);
        return res.status(500).json({ error: error.message });
    }
};

const generateInventoryPDF = async (req, res) => {
    try {
        const { inventaireId } = req.params;

        // Fetch Inventaire details
        const inventaire = await Inventaire.findByPk(inventaireId);
        if (!inventaire) {
            return res.status(404).json({ error: `Inventaire with ID ${inventaireId} not found` });
        }

        // Fetch the article details
        const article = await Article.findByPk(inventaire.id_article);
        if (!article) {
            return res.status(404).json({ error: `Article with ID ${inventaire.id_article} not found` });
        }

        // Fetch details of products in the inventory
        const etatStocks = await EtatStock.findAll({
            where: { id_inventaire: inventaireId }
        });
        if (!etatStocks || etatStocks.length === 0) {
            return res.status(404).json({ error: 'Etat Stocks not found' });
        }

        // Prepare products details
        const produitsDetails = [];
        for (const etatStock of etatStocks) {
            const produit = await Produit.findByPk(etatStock.id_produit);
            if (!produit) {
                return res.status(404).json({ error: `Produit with ID ${etatStock.id_produit} not found` });
            }
            produitsDetails.push({
                produitName: produit.name || 'N/A',
                physicalquantity: etatStock.physicalquantity,
                observation: etatStock.observation || 'N/A',
                logicalquantity: etatStock.logicalquantity
            });
        }

        // Render HTML template with EJS
        const templatePath = path.resolve(fileURLToPath(import.meta.url), '../etatInventaireTemplate.ejs');
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = ejs.render(templateContent, {
            inventaire,
            article,
            produitsDetails
        });

        // Define PDF options
        const pdfOptions = { format: 'A4' };

        // Generate PDF and send as response
        htmlPdf.create(htmlContent, pdfOptions).toBuffer((err, buffer) => {
            if (err) {
                console.error('Failed to generate Etat Inventaire PDF:', err);
                return res.status(500).json({ error: 'Failed to generate Etat Inventaire PDF' });
            }
            // Set Content-Disposition header to prompt the browser to download the file
            res.setHeader('Content-Disposition', 'attachment; filename=etatInventaire.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            // Send the PDF buffer as the response
            res.send(buffer);
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};


export { generatePDF, generateBonSortiePDF , generateBonCommandePDF , generateBonReceptionPDF , generateBonDechargePDF , generateInventoryPDF}
