migrate(
  (app) => {
    const collection = new Collection({
      name: "projects",
      type: "base",
      fields: [
        {
          name: "owner_id",
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
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "description",
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
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("projects");
    return app.delete(collection);
  }
);
