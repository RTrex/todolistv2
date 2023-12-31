const express = require("express");

const mongoose = require("mongoose");

const bodyParser = require("body-parser");

const app = express();

const _ = require("lodash");

require("dotenv").config();

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema ({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
  Item.find({}).then(function(foundItems){ 
    if (foundItems.length === 0 ) {
         Item.insertMany(defaultItems)
          .then(function(){
              console.log("successfull");
              })
          .catch (function(err){
               console.log(err);
              })
     
    }
    else {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
  .catch(function(err){
    console.log(err);
  });
})

app.post ("/", function(req , res){
  const add1 = req.body.newItem;
  const listName = req.body.List;
  const item = new Item ({
   name: add1
  })
if (listName === "Today"){
  item.save();
  res.redirect("/");
}
else {
  List.findOne({name : listName}).then(function(foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" +listName);
  })
}
})

app.post("/delete", function(req, res){
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
        console.log("Successfully deleted checked item")
        res.redirect("/");
    });
} else{
    List.findByIdAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .catch((err) => {
            if(!err){
                res.redirect("/" + listName);
            }
          });
        }
      })


app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName})
  .then(function(foundList){
      
        if(!foundList){
          const list = new List({
            name:customListName,
            items:defaultItems
          });
        
          list.save();
          console.log("saved");
          res.redirect("/"+customListName);
        }
        else{
          res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
        }
  })
  .catch(function(err){

  });

})

app.listen(3000, function(){
    console.log("This server is up at 3000 port");
})