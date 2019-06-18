db.createUser({
  user: 'datatrain',
  pwd: 'init12345',
  roles: [
    {
      role: 'readWrite',
      db: 'datatrain'
    }
  ]
});
