
import applicationparams from '../models/paramsModel.js'; 

const modifyParams = async (req, res) => {
    try {
      const { establishmentname, logo, tauxtva } = req.body;
  
      // Find all params records
      const params = await applicationparams.findAll();
  
      // If there are no params records, create a new one
      if (params.length === 0) {
        const newParams = await applicationparams.create({ establishmentname, logo, tauxtva });
        return res.status(200).json({ message: 'Params created successfully', params: newParams });
      }
  
      // If there is at least one params record, update the first one
      const [firstParams] = params;
      await firstParams.update({ establishmentname, logo, tauxtva });
  
      return res.status(200).json({ message: 'Params modified successfully', params: firstParams });
    } catch (error) {
      return res.status(500).json({ message: 'Error modifying params', error: error.message });
    }
  };

export default modifyParams ;