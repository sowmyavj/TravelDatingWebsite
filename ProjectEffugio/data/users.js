const uuidv1 = require('uuid/v4');
const bluebird = require("bluebird");
const Promise = bluebird.Promise;
const mongoCollections = require("../config/mongoCollections");
const usersList=mongoCollections.users;
var ObjectID=require('mongodb').ObjectID;
var bcrypt = Promise.promisifyAll(require("bcrypt"));



let exportedMethods = {

    //Get the user based on user id - useful in login
    async  getUserbyUserId(user_id) {
        if(!user_id) throw "You must provide an id to search for a user";
        
        const userCollection = await usersList();
        const listOfUsers = await userCollection.find({ user_id: user_id }).limit(1).toArray();
        if (listOfUsers.length === 0) throw "Could not find user with username " + user_id;
            
        return listOfUsers[0];
                
       
    },

    //Get the user based on uuid _id
    async  getUser(_id) {
        if(!_id) throw "You must provide an id to search for a user";
        
        const userCollection = await usersList();
        const listOfUsers = await userCollection.find({ _id: _id }).limit(1).toArray();
        if (listOfUsers.length === 0) throw "Could not find user with username " + _id;
            
        return listOfUsers[0];
                
       
    },

    //Get all users in the system
    async getAllUsers() {

        const userCollection = await usersList();
        const listOfUsers = await userCollection.find().toArray();
        

        users=[];
        oneUser={};

        for(var val of listOfUsers){
            oneUser={};
            oneUser._id=val._id;
            oneUser.user_id=val.user_id
            oneUser.name=val.name;
            oneUser.hashedPassword=val.hashedPassword;
            oneUser.age=val.age;
            oneUser.gender=val.gender;
            oneUser.location=val.location;
            oneUser.occupation=val.occupation;
            oneUser.orientation=val.orinetation;
            oneUser.location_pref=val.location_pref;
            oneUser.connections=val.connections;

            users.push(oneUser);
        }

        return users;
    },

    //Get connections of a user
    async  getConnections(_id) {
        if(!_id) throw "You must provide an id to search for a recipe";
        
        user= await this.getUser(_id);
            
        return user.connections;
    },

    //add user to the collection
    async addUser(user,password) {
        
        const userCollection = await usersList();
        
    
        const newUser = {
            _id: uuidv1(),
            user_id:user.user_id,
            hashedPassword:"",
            name:user.name,
            age:user.age,
            gender:user.gender,
            location:user.location,
            occupation:user.occupation,
            orientation:user.orinetation,
            contact_info:user.contact_info,
            location_pref:user.location_pref,
            connections:user.connections
        };


        const hash = await bcrypt.hashAsync(password, 16.5);
        
        newUser.hashedPassword=hash;
        
        
        console.log(newUser);
        const newInsertInformation = await userCollection.insertOne(newUser);
        const newId = newInsertInformation.insertedId;
        console.log("inserted: "+newId);
        return await this.getUser(newId);
    },

    //add connection to user
    async addConnection(id,connectedid) {
        if (typeof connectedid !== "string") throw "No connectedid provided";
 
        
        oldUser=await this.getUser(id);

        const newUser = {
            _id:oldUser._id,
            user_id:oldUser.user_id,
            name:oldUser.name,
            age:oldUser.age,
            gender:oldUser.gender,
            location:oldUser.location,
            occupation:oldUser.occupation,
            orientation:oldUser.orinetation,
            contact_info:oldUser.contact_info,
            location_pref:oldUser.location_pref,
            hashedPassword:oldUser.hashedPassword,
            connections:oldUser.connections
           
        };
        newUser.connections.push(connectedid);
        const userCollection = await usersList();
        
        output= await userCollection.updateOne({ _id: newUser._id }, newUser);
        return await this.getUser(newUser._id);
    },

    async updateUser(user) {
        
        oldUser=await this.getUser(user._id);
        const newUser = {
            user_id:oldUser.user_id,
            name:oldUser.name,
            age:oldUser.age,
            gender:oldUser.gender,
            location:oldUser.location,
            occupation:oldUser.occupation,
            orientation:oldUser.orinetation,
            contact_info:oldUser.contact_info,
            location_pref:oldUser.location_pref,
            hashedPassword:oldUser.hashedPassword
           
        };

        //TODO: check here or in html??
        if(user.name != null){
            updatedUser.name=user.name;
        }

        if(user.age != null){
            updatedUser.age=user.age;
        }

        if(user.location != null){
            updatedUser.location=user.location;
        }

        if(user.occupation != null){
            updatedUser.occupation=user.occupation;
        }

        if(user.orinetation != null){
            updatedUser.orinetation=user.orinetation;
        }

        if(user.contact_info != null){
            updatedUser.contact_info=user.contact_info;
        }

        if(user.location_pref != null){
            updatedUser.location_pref=user.location_pref;
        }

        if(user.hashedpassword != null){
            updatedUser.hashedPassword=user.hashedPassword;
        }
        
        const userCollection = await usersList();
        // our first parameters is a way of describing the document to update;
        // our second will be a replacement version of the document;
        output= await userCollection.updateOne({ _id: updatedUser._id }, updatedUser);
        return await this.getUser(updatedUser._id);
    },

    //remove user
    async removeUser(id) {
        const userCollection = await usersList();
        const deletionInfo = await userCollection.removeOne({ _id: id });
        if (deletionInfo.deletedCount === 0) {
          throw `Could not delete user with id of ${id}`;
        }
      },

      //remove connection
    async removeConnection(id,connectionToRemove) {
        changeUser=await this.getRecipeByCommentID(id);
        connections=[];
        oneComement={};

        for(var val of changeUser.connections){
            if(id != val)
                {
                    connections.push(val);
                }
                 
        };
        
        changeUser.connections=connections;
        const recipeCollection = await usersList();
        output= await recipeCollection.updateOne({ _id: changeUser._id }, changeUser);
        if (output.updatedCount === 0) {
          throw `Could not delete comment with id of ${id}`;
        }
      },

      //compare the passwords
      async comparePassword(password,hash){
            result= await bcrypt.compareAsync(password, hash);
            return result;
      }
    
}

module.exports=exportedMethods;