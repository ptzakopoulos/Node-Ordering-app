const selector = document.getElementById('category')
const containers = {
    sales : document.getElementById('sales'),
    users : document.getElementById('users'),
    orders : document.getElementById('orders'),
}

containers.sales.classList.add('active')

const onSelectHandler = e => {

    containers.sales.classList.remove('active')
    containers.users.classList.remove('active')
    containers.orders.classList.remove('active')

    containers[e.target.value].classList.add('active')
}

selector.addEventListener('change',onSelectHandler)