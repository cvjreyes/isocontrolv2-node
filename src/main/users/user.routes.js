const router = require("express").Router(),
  users = require("./user.controller");

// // Create a new user
// router.post("/api/user", users.create);

// Retrieve all users
// // router.get("/api/users", users.findAll); OLD
router.get("/findAll", users.findAll);

// Retrieve a single user with userId
router.get("/findOne/:email", users.findOne);

router.post("/login", users.login);

// router.post("/api/user/getPassword", users.getPassword);

// router.post("/user/changePassword", users.changePassword);

// // Retrieve a single user with email
// router.get("/api/userEmail/:userEmail", users.findOneByEmail);

// router.get("/api/users/:tab", users.getUsersByTab);

// // Retrieve a single user with username
// router.post("/api/findByEmail", users.findOneByUsername);

// // Update a user with userId
// router.put("/api/user/:userId", users.update);

// // Delete a user with userId
// router.delete("/api/user/:userId", users.delete);

// // Create a new user
// router.delete("/api/users", users.deleteAll);

// router.post("/createUser", users.createUser);

// router.get("/usersWithRoles", users.usersWithRoles);

// router.post("/users/manageRoles", users.manageRoles);

// router.get("/downloadUsers", users.downloadUsers);

// router.get("/notifications/:email", users.notifications);

// router.post("/markAllNotificationsAsRead", users.markAllNotificationsAsRead);

// router.post("/markNotificationAsRead", users.markNotificationAsRead);

// router.post("/markNotificationAsUnread", users.markNotificationAsUnread);

// router.post("/deleteNotification", users.deleteNotification);

module.exports = router;
