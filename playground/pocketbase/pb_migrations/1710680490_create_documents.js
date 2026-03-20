migrate(
  (app) => {
    const collection = new Collection({
      name: "documents",
      type: "base",
      fields: [
        { name: "file", type: "file", required: true, maxSelect: 1, maxSize: 10485760 },
        { name: "path", type: "text", required: false },
        { name: "mime_type", type: "text", required: false },
        { name: "size", type: "number", required: false },
      ],
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("documents");
    return app.delete(collection);
  }
);
