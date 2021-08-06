import AttributeData from '../models/AttributeData.js';


export const createAttribute= async(req,res) => {

   const attrbiute = req.body;

   const newAttribute = new AttributeData({ ...attrbiute, createdAt: new Date().toISOString() });
   try {
       await newAttribute.save()
       res.status(201).json(newAttribute);
   } catch (error) {
       res.status(409).json({ message : error.message})
   }
}



export const getAttribute = async (req,res) => {
    //res.send('THIS GOOD');
    try {
        const AllAttribute = await AttributeData.find();
        res.status(200).json(AllAttribute);
    } catch (error) {
        res.status(404).json({message : error.message});
    }
}
