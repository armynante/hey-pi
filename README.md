Hey-PI helps you to test and deploy your web projects without worrying about setting up a database. Simply store relevant data by making POST requests to the Hey-PI server, and get your data back by making GET requests with URL parameters for queries.

## Storing Data

Make a POST request with JSON content. The first URL parameter should specify which collection you are adding the data to. 

`hey-pi.com/users`

You can also used nested queries to create a foreign key relationship with an existing object in another collection. 

`hey-pi.com/user_name_is_brian/todos` will add the JSON content as a "to-do" for the user whose name is "Brian".

## Sample Queries

Make an HTTP GET request to receive data back in JSON format. 

`hey-pi.com/users/age_greater_than_5`

`hey-pi.com/users/age_less_than_20`

`hey-pi.com/task/name_is_grocery`

`hey-pi.com/task/name_is_not_exercise`

`hey-pi.com/todo/deadline_is_in_future`

`hey-pi.com/todo/deadline_is_in_past`

You can also string together filters, there are no limits how many filters you can string together at the same time. 

`hey-pi.com/user/status_is_active/age_is_greater_than_20`