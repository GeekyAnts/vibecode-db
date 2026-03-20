migrate(
  (app) => {
    const collection = new Collection({
      name: "activity_logs",
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
          name: "entity_type",
          type: "text",
          required: true,
        },
        {
          name: "entity_id",
          type: "text",
          required: true,
        },
        {
          name: "action",
          type: "text",
          required: true,
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
    const collection = app.findCollectionByNameOrId("activity_logs");
    return app.delete(collection);
  }
);
