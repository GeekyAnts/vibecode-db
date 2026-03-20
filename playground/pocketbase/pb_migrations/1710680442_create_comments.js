migrate(
  (app) => {
    const collection = new Collection({
      name: "comments",
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
          name: "task_id",
          type: "relation",
          required: true,
          options: {
            collectionId: "tasks",
            cascadeDelete: true,
            maxSelect: 1,
            minSelect: 1,
          },
        },
        {
          name: "parent_comment_id",
          type: "relation",
          required: false,
          options: {
            collectionId: "comments",
            cascadeDelete: true,
            maxSelect: 1,
            minSelect: 0,
          },
        },
        {
          name: "content",
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
    const collection = app.findCollectionByNameOrId("comments");
    return app.delete(collection);
  }
);
