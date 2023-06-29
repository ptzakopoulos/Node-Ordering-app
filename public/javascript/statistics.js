const selector = document.getElementById("category");
const containers = {
  sales: document.getElementById("sales"),
  users: document.getElementById("users"),
  orders: document.getElementById("orders"),
};

containers.sales.classList.add("active");

const onSelectHandler = (e) => {
  containers.sales.classList.remove("active");
  containers.users.classList.remove("active");
  containers.orders.classList.remove("active");

  containers[e.target.value].classList.add("active");
};

selector.addEventListener("change", onSelectHandler);

//__________Products__________

const prodTitle = document.querySelectorAll(".prod-title");
const prodQuantity = document.querySelectorAll(".prod-quantity");

const sort = document.getElementById("sales-sort");

const products = [];
const prodQuantities = [];
const prodTitles = [];
let sortedProducts = [];

prodTitle.forEach((prod, i) => {
  products[i] = {
    title: prod.getAttribute("value"),
    quantity: parseInt(prodQuantity[i].getAttribute("value")),
  };
  prodQuantities[i] = products[i].quantity;
  prodTitles[i] = products[i].title;
});

const productSort = (option) => {
  const quantities = [...prodQuantities];
  const titles = [...prodTitles];

  for (let i in products) {
    if (option === "min" || option === "max") {
      const math = Math[option](...quantities);

      const index = quantities.findIndex((i) => {
        return i === math;
      });

      sortedProducts[i] = {
        title: titles[index],
        quantity: math,
      };

      quantities.splice(index, 1);
      titles.splice(index, 1);
    } else {
      sortedProducts = [...products];
    }
    prodTitle[i].textContent = sortedProducts[i].title;
    prodQuantity[i].textContent = `x${sortedProducts[i].quantity}`;
  }
};

const sortHandler = (e) => {
  productSort(e.target.value);
};

sort.addEventListener("change", sortHandler);

//Colors

const roles = document.querySelectorAll(".users h5");

roles.forEach((role) => {
  role.classList.add(role.textContent);
});
