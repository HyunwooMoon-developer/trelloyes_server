/* eslint-disable no-undef */
const express = require('express');
const {v4: uuid} = require('uuid');
const logger = require('../logger')
const {cards, lists} = require('../store');

const cardRouter = express.Router();
const bodyParser = express.json();


cardRouter
.route('/card')
.get((req, res) => {
    //move implementation logic into here
    res.json(cards);
})
.post(bodyParser, (req, res) => {
    const {title, content} = req.body;
  if(!title){
    logger.error(`title is required`);
    return res.status(400).send('invalid data');
  }
  if(!content){
    logger.error(`content is required`);
    return res.status(400).send('invalid content')
    }
    const id = uuid();
    const card = {
      id,
      title, 
      content 
    };
    cards.push(card);

    logger.info(`card with id ${id} created`);
    res.status(201)
    .location(`http://localhost:8000/card/${id}`)
    .json(card);
})

cardRouter
.route('/card/:id')
.get((req,res) => {
const {id} = req.params;
const card = cards.find(c => c.id == id);

//make sure found a card
if(!card){
  logger.error(`card with id ${id} not found`);
  return res.status(404).send('card not found');
}
res.json(card);})
.delete((req, res) => {
const {id} = req.params ;

const cardIndex = cards.findIndex(c => c.id == id);

if(cardIndex === -1){
  logger.error(`card with id ${id} not found`);
  return res.status(404).send('not found');
}
//remove card from lists
//assume cardIds are not duplicated in the cardIds array
lists.forEach(list => {
  const cardIds = list.cardIds.filter(cid => cid!== id);
  list.cardIds = cardIds;
});

cards.splice(cardIndex, 1);

logger.info(`card with id ${id} deleted`);

res.status(204).end();})

module.exports = cardRouter ;
