/* VARIABLES */

let offset = 0
let limit = 10
const app = document.getElementById('app')
const searchInput = document.getElementById('searchInput')
const search = document.getElementById('searchBtn')
const prev = document.getElementById('prevBtn')
const next = document.getElementById('nextBtn')
const reset = document.getElementById('resetBtn')
const saved = document.getElementById('saved')
const delBtn = document.getElementById('delete')

if(localStorage.getItem('savedPokemon') == null){
    localStorage.setItem('savedPokemon', '[]')
}

const getAll = async (url) => {
    try{
        const response = await fetch(url)
        if(!response.ok){
            throw new Error('Problema con la obtención de datos ', response.status)
        }
        const data = await response.json()
        getInfo(data.results)
    } catch(err){
        console.log(err)
    }
}

const getPokemon = async (pokemonURL) => {
    try{
        const response = await fetch(pokemonURL)
        if(!response.ok){
            throw new Error('Problema con la obtención de datos ', response.status)
        }
        const data = await response.json()
        return data
    } catch(err){
        console.log(err)
        return undefined
    }
}

/* FUNCTIONS */

function getInfo(pokemons) {
    let text = ''
    let promises = []
    pokemons.forEach(element => {
        promises.push(getPokemon(element.url))
    })
    Promise.all(promises).then((values) => {
        values.forEach((pokemon) => {
            text += createDiv(pokemon)
        })
    }).then(() => {
        app.innerHTML = text
    })
}

function createDiv(pokemon) {
    let index = indexOnPokemonList(pokemon)
    if(index != -1){
        let pokemon = JSON.parse(localStorage.getItem('savedPokemon'))[index]
        return `
            <div class="pokemon rojo" onclick="savePokemon('${pokemon.name}')" id="${pokemon.name}">
            <svg>
                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
            </svg>
                <img src="${pokemon.image}">
                <h4 class="name">#${pokemon.id} ${pokemon.name}</h4>
            </div>
            `
    }else{
        return `
            <div class="pokemon" onclick="savePokemon('${pokemon.name}')" id="${pokemon.name}">
            <svg>
                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
            </svg>
                <img src="${pokemon.sprites.other.home.front_default}">
                <h4 class="name">#${pokemon.id} ${pokemon.name}</h4>
            </div>
        `
    }
}

function savePokemon(name) {
    let elemento = document.getElementById(name)
    let pokemonList = JSON.parse(localStorage.getItem('savedPokemon'))
    getPokemon(`https://pokeapi.co/api/v2/pokemon/${name}/`).then((data) => {
        let index = indexOnPokemonList(data)
        if(index != -1){
            elemento.classList.remove('rojo')
            pokemonList.splice(index, 1)
        }else{
            elemento.classList.add('rojo')
            let pokemon = {
                id:data.id,
                name:data.name,
                image:data.sprites.other.home.front_default
            }
            pokemonList.push(pokemon)
            pokemonList.sort((a, b) => a.id > b.id)
        }
        localStorage.setItem('savedPokemon', JSON.stringify(pokemonList))
    })
}

function indexOnPokemonList(element) {
    let ans = -1
    let pokemonList = JSON.parse(localStorage.getItem('savedPokemon'))
    for (const pokemon of pokemonList) {
        ans++
        if(pokemon.id == element.id){
            return ans
        }
    }
    return -1
}

/* LISTENERS */
prev.addEventListener('click', () => {
    if(offset > 0){
        offset -= 10
        if(offset < 0) offset = 0
        getAll(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
    }
})

next.addEventListener('click', () => {
    if(offset < 1300){
        offset += 10
        getAll(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
    } 
})

reset.addEventListener('click', () => {
    searchInput.value = ''
    getAll(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
})

search.addEventListener('click', () => {
    getPokemon(`https://pokeapi.co/api/v2/pokemon/${searchInput.value}/`).then((data) =>{
        app.innerHTML = createDiv(data)
    }).catch((err) => {
        app.innerHTML = `<div id="notFound">Pokemon no encontrado</div>`
    })
})

saved.addEventListener('click', () => {
    delBtn.style.display = ''
    let pokemons = JSON.parse(localStorage.getItem('savedPokemon'))
    let text = ''
    pokemons.forEach((pokemon) => {
        text += createDiv(pokemon)
    })
    app.innerHTML = text
})

delBtn.addEventListener('click', () => {
    delBtn.style.display = 'none'
    localStorage.setItem('savedPokemon', '[]')
    getAll(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
})

/* INITIALIZE */

getAll(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)