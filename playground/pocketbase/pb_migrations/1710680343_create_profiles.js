migrate(
  (app) => {
    const collection = new Collection({
      name: "profiles",
      type: "base",
      fields: [
        {
          name: "user_id",
          type: "relation",
          required: true,
          options: {
            collectionId: "users",
            cascadeDelete: true,
            maxSelect: 1,
            minSelect: 1,
          },
        },
        {
          name: "avatar_url",
          type: "url",
          required: false,
        },
        {
          name: "bio",
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
      indexes: ['CREATE UNIQUE INDEX idx_profiles_user_id ON profiles (user_id)'],
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("profiles");
    return app.delete(collection);
  }
);
