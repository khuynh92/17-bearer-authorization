[![Build Status](https://travis-ci.com/khuynh92/16-basic-authentication.svg?branch=master)](https://travis-ci.com/khuynh92/16-basic-authentication)

Travis: https://travis-ci.com/khuynh92/17-bearer-authorization  
Heroku: https://khoa-17-bearer-auth.herokuapp.com  
PR: https://github.com/khuynh92/17-bearer-authorization/pull/1  

## 17-bearer-authorization


in order to run this app:

 1. clone this repository


 2. in your root folder, create a .env file and set PORT, MONGODB_URI, and APP_SECRET values.  example: 

 ```
 PORT = 3000
 MONGODB_URI = 'mongodb://localhost/lab_16'
 APP_SECRET = 'sssshhhhhhhhh'

 ``` 

 3. First start up your mongo server, and then in your terminal, locate where you cloned this repository, and then type the command: `npm start`. This will begin the server.

 4. in your broswer go to  
`http://localhost:<YOURPORTHERE>`  

 5. Here, you can input fields to test the POST request. The post request will direct you to `http://localhost:<YOURPORTHERE>/post` and show the generated JSON Web Token (jwt) from the post

 6. To test signup(post), use your choice of tools that makes requests to servers (httpie, postman). Without a header that has Basic Authorization, a 401 will be sent. if There is a header object with a Basic Authorizatoin Key, a status code of 200 will be returned with the jwt.

 7. to test the signin(get), ensure that you are signing in using a basic authentication created using the id and password from an existing user

### API Testing api/v1/pizza
*All tests must have a bearer authentication from an existing user in the database*
1. To test post, use your choice of tools that makes requests to servers (httpie, postman). send a body that includes a name, style, and toppings. The response will be the sent body with an included id from the user who created the post

body example:
```
{
  "name":"Hawaiian",
  "style":"New York",
  "toppings":"Hawaiian "
}
```
2. To test get by going to api/v1/pizza. This will show you the pizzas that ONLY YOU have created. You will be sent a 401 error and denied access if you try to access another users data.

3. To test get by going to api/v1/pizza/<id>. This will show you the pizza that ONLY YOU have created. You will be sent a 401 error and denied access if you try to access another users data.

4. To test DELETE, use your choice of tools that makes requests to servers (httpie, postman). If no id is passed, a 404 error will appear. DELETE requests will only work on pathnames with id parameters: `api/v1/pizza/<your id here>`. You will only have access to delete data that you have create. A 401 error will be sent if you try to delete another users data

5. To test PUT, use your choice of tools that makes requests to servers (httpie, postman). If no id is passed, a 404 error will appear. PUT requests will only work on pathnames with id parameters: `api/v1/pizza/<your id here>`. You will only have access to change data that you have create. A 401 error will be sent if you try to delete another users data



**This lab was built off of codefellows 17-bearer-authorization demo code**