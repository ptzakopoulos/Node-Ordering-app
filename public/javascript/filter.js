const filter = document.getElementById('filter')
const products = [...document.querySelectorAll('.product-card')]


const onFilterHandler = (filter) => {
    const filterValue = filter.target.value

    const filteredList = products.filter(e => {
        return e.getAttribute('producttype').indexOf(filterValue) > -1
    })

    products.forEach(e => {
        e.classList.add('not-displayed')
    })

    filteredList.forEach(e => {
        e.classList.remove('not-displayed')
    })

}

filter.addEventListener('change',onFilterHandler)