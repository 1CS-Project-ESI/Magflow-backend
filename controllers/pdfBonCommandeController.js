// pdfBonCommandeController.js

import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import htmlPdf from 'html-pdf';

import { BonCommandeInterne, ProduitsCommandeInterne , BonSortie, ProduitsServie} from '../models/bonsModel.js';
import { Consumer, User } from '../models/usersModel.js';
import { Produit } from '../models/productsModel.js';
import { Structure } from '../models/structuresModel.js';

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
            productDetails // Change produitsCommandeInterne to productDetails
        });

        // Define PDF options
        const options = { format: 'Letter' };

        // Generate PDF
        const pdfPath = `boncommande_${bonCommandeInterneId}.pdf`;
        htmlPdf.create(htmlContent, options).toFile(pdfPath, (err, response) => {
            if (err) {
                console.error('Failed to generate PDF:', err);
                return res.status(500).json({ error: 'Failed to generate PDF' });
            }
            console.log('PDF generated successfully:', response);
            return res.status(200).json({ pdfPath });
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
        if (!produitsServis) {
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
        const pdfPath = `bonSortie_${bonSortieId}.pdf`;
        htmlPdf.create(htmlContent, options).toFile(pdfPath, (err, response) => {
            if (err) {
                console.error('Failed to generate Bon de Sortie PDF:', err);
                return res.status(500).json({ error: 'Failed to generate Bon de Sortie PDF' });
            }
            console.log('Bon de Sortie PDF generated successfully:', response);
            return res.status(200).json({ pdfPath });
        });
    } catch (error) {
        console.error('Error generating Bon de Sortie PDF:', error);
        return res.status(500).json({ error: error.message });
    }
};

export { generatePDF, generateBonSortiePDF}
