// Kambaz/Users/dao.js
import { v4 as uuidv4 } from "uuid";
import model from "./model.js";
import mongoose from "mongoose";

// Make sure model is properly imported at the top

export const createUser = (user) => {
  const newUser = { ...user, _id: uuidv4() };
  return model.create(newUser);
};

export const findAllUsers = () => model.find();

export const findUserById = (userId) => model.findById(userId);

export const findUserByUsername = (username) => {
  console.log(`DAO: Finding user by username: ${username}`);
  return model.findOne({ username });
};

export const findUsersByRole = (role) => model.find({ role });

export const findUsersByPartialName = (partialName) => {
  const regex = new RegExp(partialName, "i");
  return model.find({
    $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
  });
};

export const findUserByCredentials = (username, password) => {
  console.log(`DAO: Finding user by credentials: username=${username}, password=${password}`);
  return model.findOne({ username, password }).then(user => {
    console.log("DAO: Query result:", user);
    return user;
  });
};

export const updateUser = (userId, user) => model.updateOne({ _id: userId }, { $set: user });

export const deleteUser = (userId) => model.deleteOne({ _id: userId });