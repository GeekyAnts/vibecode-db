migrate(
  (app) => {
    const collection = new Collection({
      name: "users",
      type: "base",
      fields: [
        {
          name: "email",
          type: "email",
          required: true,
        },
        {
          name: "name",
          type: "text",
          required: false,
        },
        {
          name: "created_at",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_users_email ON users (email)'],
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("users");
    return app.delete(collection);
  }
);
