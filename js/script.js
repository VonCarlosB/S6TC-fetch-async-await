let offset = 0
let limit = 10
const app = document.getElementById('app')
const searchInput = document.getElementById('searchInput')
const search = document.getElementById('searchBtn')
const prev = document.getElementById('prevBtn')
const next = document.getElementById('nextBtn')
const reset = document.getElementById('resetBtn')
const saved = document.getElementById('saved')

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
    return `
            <div class="pokemon" onclick="savePokemon('${pokemon.name}')">
                <img src="${pokemon.sprites.other.home.front_default}">
                <h4 class="name">#${pokemon.id} ${pokemon.name}</h4>
            </div>
            `
}

function savePokemon(name) {
    let pokemonList = JSON.parse(localStorage.getItem('savedPokemon'))
    getPokemon(`https://pokeapi.co/api/v2/pokemon/${name}/`).then((data) => {
        let isOnList = false
        pokemonList.forEach((element) => {
            if(element.name === data.name){
                isOnList = true
            }
        })
        if(!isOnList){
            pokemonList.push(data)
            pokemonList.sort((a, b) => a.id > b.id)
            localStorage.setItem('savedPokemon', JSON.stringify(pokemonList))
        }
    })
}

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
    localStorage.setItem('savedPokemon', '[]')
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

getAll(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)

saved.addEventListener('click', () => {
    let pokemons = JSON.parse(localStorage.getItem('savedPokemon'))
    let text = ''
    pokemons.forEach((pokemon) => {
        text += createDiv(pokemon)
    })
    app.innerHTML = text
})