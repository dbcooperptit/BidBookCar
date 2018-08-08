var Order = require('../models/order')

var OrderRepository = {}
OrderRepository.saveOrder = async (data)=>{
  try {
      let newOrder = new Order(data);
      await newOrder.save({_id:false});

      return newOrder;
  }  catch (e) {
      throw e.message;
  }
};
module.exports = OrderRepository;