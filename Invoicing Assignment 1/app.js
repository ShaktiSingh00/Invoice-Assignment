
$(function () {
  // const customer = new CustomerModel();
  // new CustomerFormView({ model: customer });

  $("#show-invoices-btn").on("click", function () {
    const invoiceListView = new InvoiceListView();
    invoiceListView.render();
  });
});
