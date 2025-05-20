const AppRouter = Backbone.Router.extend({
  routes: {
    '': 'home',
    'invoices': 'showInvoiceList',
  },

  home() {
    const view = new CustomerFormView();
    $('#app').html(view.render().el);
  },

  showInvoiceList() {
    const collection = new InvoiceCollection();
    const view = new InvoiceListView({ collection });
    $('#app').html(view.el); // Render will populate this.el
  }
});
