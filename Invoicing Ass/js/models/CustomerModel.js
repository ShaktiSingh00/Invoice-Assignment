const CustomerModel = Backbone.Model.extend({
  url: () => "https://shakti.orgzit.com/api/1/ozrecord/",
  sync: function (method, model, options) {
    options = options || {};
    options.type = "POST";
    options.headers = {
      Authorization: CONFIG.API_KEY,
      "Content-Type": "application/json",
    };
    options.data = JSON.stringify({
      dataform: `/api/1/dataform/${CONFIG.DATAFORM_SLUG}/`,
      dataform_id: CONFIG.DATAFORM_SLUG,
      fields: {
        customer_name: model.get("customer_name"),
        invoice_date: model.get("invoice_date"),
      },
    });
    this.listenTo(this.collection, "sync", this.render);
  },
});