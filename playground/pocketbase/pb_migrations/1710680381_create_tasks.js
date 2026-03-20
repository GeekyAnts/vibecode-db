migrate(
  (app) => {
    const collection = new Collection({
      name: "tasks",
      type: "base",
      fields: [
        {
          name: "project_id",
          type: "relation",
          required: true,
          options: {
            collectionId: "projects",
            cascadeDelete: true,
            maxSelect: 1,
            minSelect: 1,
          },
        },
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "status",
          type: "select",
          required: false,
          options: {
            values: ["todo", "in_progress", "done"],
            maxSelect: 1,
          },
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
    const collection = app.findCollectionByNameOrId("tasks");
    return app.delete(collection);
  }
);
