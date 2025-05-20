

const CustomerFormView = Backbone.View.extend({
  el: "#app",

  template: _.template(`
    <div class="container mt-4">
      <h2 class="mb-4">Create Invoice</h2>
      <form id="customer-form">
        <div class="mb-3">
          <label for="customer-name" class="form-label">Customer Name</label>
          <input type="text" class="form-control" id="customer-name" required>
        </div>

        <div class="mb-3">
          <label for="invoice-date" class="form-label">Invoice Date</label>
          <input type="date" class="form-control" id="invoice-date" required>
        </div>

        <div class="mb-3">
          <label class="form-label">Invoice Items</label>
          <div id="invoice-items" class="d-flex flex-column gap-2"></div>
          <button type="button" class="btn btn-outline-primary mt-2" id="add-item">Add Invoice Item</button>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button type="submit" class="btn btn-success">Submit</button>
          <button type="button" class="btn btn-secondary" id="show-invoices">Show Invoices</button>
        </div>
      </form>
    </div>
  `),

  events: {
    "submit #customer-form": "submitForm",
    "click #add-item": "addInvoiceItem",
    "click .remove-item": "removeInvoiceItem",
    "input .quantity": "updateAmount",
    "click #show-invoices": "goToInvoices"
  },

  initialize: function () {
    this.render();
  },

  render: function () {
    return this.$el.html(this.template());
  },

  addInvoiceItem: function () {
    const $removeBtn = $(`
    <div>
      <button type="button" class="btn btn-sm btn-outline-danger remove-item">❌</button>
    </div>
    `);

    const $productSelect = $(`
    <div>
      <select class="form-select product-select" style="width: 200px;"></select>
    </div>
    `);

    const $quantityInput = $(`
    <input type="number" class="form-control quantity" value="1" min="1" style="width: 80px;">
    `);

    const $unitPriceInput = $(`
    <input type="text" class="form-control unit-price" readonly placeholder="Price" style="width: 100px;">
    `);

    const $amountInput = $(`
    <input type="text" class="form-control amount" readonly placeholder="Amount" style="width: 100px;">
    `);

    const $row = $(`
    <div class="invoice-item-row d-flex align-items-center gap-2 position-relative"></div>
    `);

    $row.append($removeBtn, $productSelect, $quantityInput, $unitPriceInput, $amountInput);
    this.$("#invoice-items").append($row);
    this.initializeSelect2($productSelect.find(".product-select"));
  },


  initializeSelect2: function ($select) {
    $select.select2({
      placeholder: "Search product...",
      width: 'resolve',
      dropdownParent: $select.closest(".invoice-item-row"), // anchors dropdown properly
      ajax: {
        url: `https://shakti.orgzit.com/api/1/datafield/${CONFIG.ITEM_FIELD_ID}/edit_choices/`,
        type: "GET",
        dataType: "json",
        headers: { Authorization: CONFIG.API_KEY },
        data: params => ({
          item_type: "",
          q: params.term || ""
        }),
        processResults: data => ({
          results: (data?.values?.choices || []).map(item => ({
            id: item.v,
            text: item.d
          }))
        }),
        cache: true
      }
    });

    // Handle selection and fetch price
    $select.on("select2:select", e => {
      const selected = e.params.data;
      const $row = $select.closest(".invoice-item-row");

      $.ajax({
        url: `https://shakti.orgzit.com/api/1/field_attribute_map/${CONFIG.FK_FIELD_ID}/default_fk_value/?record=${selected.id}`,
        headers: { Authorization: CONFIG.API_KEY },
        success: function (res) {
          const price = parseFloat(res.value) || 0;
          const qty = parseFloat($row.find(".quantity").val()) || 1;
          $row.find(".unit-price").val(price.toFixed(2));
          $row.find(".amount").val((price * qty).toFixed(2));
        },
        error: function () {
          $row.find(".unit-price, .amount").val("");
        }
      });
    });
  },

  updateAmount: function (e) {
    const $row = $(e.currentTarget).closest(".invoice-item-row");
    const qty = parseFloat($row.find(".quantity").val()) || 1;
    const price = parseFloat($row.find(".unit-price").val()) || 0;
    $row.find(".amount").val((qty * price).toFixed(2));
  },

  submitForm: function (e) {
    e.preventDefault();

    // Build invoice data (example)
    const customerName = this.$("#customer-name").val();
    const invoiceDate = this.$("#invoice-date").val();

    const invoiceItems = [];
    this.$("#invoice-items .invoice-item-row").each(function () {
      const $row = $(this);
      invoiceItems.push({
        productId: $row.find(".product-select").val(),
        quantity: parseInt($row.find(".quantity").val()) || 1,
        unitPrice: parseFloat($row.find(".unit-price").val()) || 0,
        amount: parseFloat($row.find(".amount").val()) || 0,
      });
    });

    if (!customerName || !invoiceDate || invoiceItems.length === 0) {
      alert("Please fill all required fields and add at least one invoice item.");
      return;
    }

    // Example: Create model or call controller (customize as needed)
    const customerModel = new CustomerModel({
      name: customerName,
      invoiceDate: invoiceDate,
      items: invoiceItems
    });

    InvoiceController.submitInvoice(customerModel, this);
  },
  removeInvoiceItem: function (e) {
    $(e.currentTarget).closest(".invoice-item-row").remove();
  },

  goToInvoices() {
    Backbone.history.navigate('invoices', { trigger: true });
  }
});
