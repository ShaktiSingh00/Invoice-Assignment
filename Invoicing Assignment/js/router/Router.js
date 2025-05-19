const AppRouter = Backbone.Router.extend({
  routes : {
    ''              : 'home',            
    'invoices'      : 'showInvoiceList',  
  },

  home() {
    const view = new CustomerFormView();
    $('#app').html(view.render().el);
  },

  showInvoiceList() {
    const collection = new InvoiceCollection();
    const listView   = new InvoiceListView({ collection });
    $('#app').html(listView.render().el);
  },
  

});

