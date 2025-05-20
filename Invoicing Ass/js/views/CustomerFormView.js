const CustomerFormView = Backbone.View.extend({
  el: "#app",

  template: _.template(`
    <h2>Create Invoice</h2>
    <form id="customer-form">
      <label>Customer Name:</label><br>
      <input type="text" id="customer-name" required><br><br>

      <label>Invoice Date:</label><br>
      <input type="date" id="invoice-date" required><br><br>

      <label>Invoice Items:</label><br>
      <div id="invoice-items"></div>
      <button type="button" id="add-item">Add Invoice Item</button><br><br>
      <button type="submit">Submit</button><br><br>
      
      <div>
        <button id="show-invoices" type="button">Show Invoices</button>

      </div>

    </form>
  `),

  events: {
    "submit #customer-form": "submitForm",
    "click #add-item": "addInvoiceItem",
    "click .remove-item": "removeInvoiceItem",
    "input .quantity": "updateAmount",
    'click #show-invoices': 'goToInvoices'

  },

  initialize: function () {
    this.render();
  },

  render: function () {
    return this.$el.html(this.template());
  },

  addInvoiceItem: function () {
    const row = $(`
      <div class="invoice-item-row">
        <button type="button" class="remove-item">❌</button>
        <select class="product-select" style="width: 200px;"></select>
        <input type="number" class="quantity" value="1" min="1" style="width: 60px;">
        <input type="text" class="unit-price" readonly style="width: 80px;">
        <input type="text" class="amount" readonly style="width: 80px;">
      </div>
    `);
    this.$("#invoice-items").append(row);
    this.initializeSelect2(row.find(".product-select"));
  },

  removeInvoiceItem: function (e) {
    $(e.currentTarget).closest(".invoice-item-row").remove();
  },

  initializeSelect2: function ($select) {
    $select.select2({
      placeholder: "Search product...",
      ajax: {
        url: `https://shakti.orgzit.com/api/1/datafield/${CONFIG.ITEM_FIELD_ID}/edit_choices/`,
        type: "GET",
        dataType: "json",
        headers: { Authorization: CONFIG.API_KEY },
        data: params => ({ item_type: "", q: params.term || "" }),
        processResults: data => ({
          results: (data?.values?.choices || []).map(item => ({
            id: item.v,
            text: item.d,
          })),
        }),
        cache: true,
      },
    });

    $select.on("select2:select", function (e) {
      const selected = e.params.data;
      const $row = $select.closest(".invoice-item-row");

      $.ajax({
        url: `https://shakti.orgzit.com/api/1/field_attribute_map/${CONFIG.FK_FIELD_ID}/default_fk_value/?record=${selected.id}`,
        headers: { Authorization: CONFIG.API_KEY },
        success: function (res) {
          const price = parseFloat(res.value) || 0;
          const qty = parseFloat($row.find(".quantity").val()) || 1;
          $row.find(".unit-price").val(price);
          $row.find(".amount").val(price * qty);
        },
      });
    });
  },

  goToInvoices() {
    Backbone.history.navigate('invoices', { trigger: true });
  },

  updateAmount: function (e) {
    const $row = $(e.currentTarget).closest(".invoice-item-row");
    const qty = parseFloat($row.find(".quantity").val()) || 1;
    const price = parseFloat($row.find(".unit-price").val()) || 0;
    $row.find(".amount").val(qty * price);
  },

  submitForm: function (e) {
    e.preventDefault();
    const customerModel = new CustomerModel();

    InvoiceController.submitInvoice(customerModel, this);

  },
  // goToInvoices() {
  //   Backbone.history.navigate('invoices', { trigger: true });
  // }
});
