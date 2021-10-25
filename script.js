$ = (tag, mother = document) => mother.querySelector(tag)
$$ = (tag, mother = document) => mother.querySelectorAll(tag)
append = (array, mother) => array.map(item => mother.appendChild(item))
var { log } = console,
pages = {
    createable: "https://api.edamam.com/api/recipes/v2?type=public"
}
const app = {
    id: '7a38059e',
    key: '985f2cfe029b4c542062bfcf4c59afe1'
}
const temp = document.querySelector('#recipesTemp')
const recipesDiv = document.querySelector('#recipes')
var request = {
        query: "chicken",
        kalories: 0
    },
    arrayLength = 0
let progressValue = 0
const progressBar = $('.progress-bar')
progress = (value = progressValue) => {
    let now = value
    if (now <= 20 && now >= 10)
        progressBar.innerHTML = 'Getting data...';
    if (now < 100 && now > 20) {
        progressBar.innerHTML = 'Writing recipes...'
        progressBar.classList.replace('bg-danger', 'bg-info')
    }
    if (now >= 100) {
        progressBar.innerHTML = 'Done...'
        progressBar.classList.replace('bg-info', 'bg-success')
        setTimeout(() => progressBar.parentNode.classList.add('d-none'), 1000);
    }
    if (now == -1) progressBar.innerHTML = "Error"
    progressBar.style.width = value + '%'
    progressBar.setAttribute('aria-valuenow', value)

}
createUrl = () => {
    let returnable = pages.createable
    Object.entries(request).map(val => {
        log(val)
        if (val[1]) {
            switch (val[0]) {
                case 'query':
                    returnable += '&q=' + request[val[0]].split(' ').join('+')
                    break;
                case 'kalories':
                    returnable += '&calories=' + val[1]
                    break;
                case 'year':
                    returnable += request[val[0]] ? '&y=' + request[val[0]] : ''
            }
        }
    })
    returnable += '&' + 'app_id=' + app.id
    returnable += '&' + "app_key=" + app.key
    pages.current = returnable
        // log(returnable, 'https://api.edamam.com/api/recipes/v2?type=public&q=chicken&app_id=7a38059e&app_key=985f2cfe029b4c542062bfcf4c59afe1')
    return returnable
}


getRecipes = (url = createUrl()) => {
    recipesDiv.innerHTML = ''
    progress()
    progressBar.parentNode.classList.remove('d-none')
    progressBar.innerHTML = 'Fetching...';
    progressBar.style.width = '0' + '%'
    progressBar.setAttribute('aria-valuenow', 0)
    progressBar.classList.replace('bg-success', 'bg-danger')
    fetch(url)
        .then(response => {
            // log(response)
            progressValue = 10
            progress()
            response.json().then(value => {
                log(value)
                pages.next = value._links.next
                progressValue = 20
                progress()
                arrayLength = value.hits.length
                if(arrayLength == 0){
                    progressValue=-1
                    progress()
                    retutn ''
                }
                for (let i = 0; i < arrayLength; i++) {
                    createRecipe(value.hits[i], i)
                    setTimeout(() => {
                        progressValue += Math.floor(80 / arrayLength)
                        progress()
                    }, 500);
                }


                // createRecipe(value.hits[0], 0)
                // createRecipe(value.hits[1], 1)
                // createRecipe(value.hits[2], 2)
            })
        })
        .catch(err => {
            progress(-1)
        });
}


function createRecipe(hit = "", id) {
    if (!hit) return false
    let { recipe } = hit
    let clone = temp.content.cloneNode(true),
        img = $('.card-img-top', clone),
        label = $('.name', clone),
        ul = $('.dropdown-menu', clone),
        li = $('.ingredient', clone)
    label.textContent = recipe.label
    img.src = recipe.image
    img.id = id
    label.setAttribute('for', id)
    $('.meal-type', clone).textContent = recipe.mealType[0].split('/').join(' & ')
    $('.kalory', clone).textContent = Math.floor(recipe.calories)
        // log(recipe)
    recipe.ingredients.map(value => {
        let lLi = li.cloneNode(true)
        lLi.innerText = '  ' + value.text
        ul.appendChild(lLi)
    })
    recipesDiv.appendChild(clone)
        // log(clone)
}

onkeyup = event => {
    let valNow = progressBar.getAttribute('aria-valuenow')
    if (valNow == '100' || valNow == '0') {
        if (event.code == "ArrowRight") {
            pages.prev = pages.current
                // pages.url = pages.next.href.split('?')[0] + '?type=public'
            pages.current = pages.next.href
            getRecipes(pages.next.href)
        } else if (event.code == "ArrowLeft") {
            if (!pages.prev) return ""
            pages.next.href = pages.current
                // pages.url = pages.next.href.split('?')[0] + '?type=public'
            pages.current = pages.prev
            getRecipes(pages.prev)
            pages.prev = ''
        }
    }
}

searchForm.onsubmit = event => {
    event.preventDefault()
    if (searchName.value) {
        request.query = searchName.value
    }
    if (searchKal.value) request.kalories = searchKal.value * 100 + "-" + searchKal.max * 100
    getRecipes()
}
$('#searchKal').onchange = event => calVal.innerHTML = +searchKal.value * 100
getRecipes()
