var confs = {
    next: "https://pokeapi.co/api/v2/pokemon?limit=6&offset=0",
    previous: "",
    target:""
}
class Pokemon {
    number;
    name;
    type;
    types = [];
    photo;
}

async function getPokemon(element){
    let pokemon = await fetch(element.url);
    return pokemon

}
async function getPokemonDetail(element){
    let pokemon = await element.json()
    return pokemon
}


async function makesRequest(){
    if(confs.target === "previous" && confs.previous){
        let body = await fetch(confs.previous);
        let response = await body.json()
        
        confs.next = response.next
        confs.previous = response.previous
        
        let results = response.results
    
        let pokemonList = await Promise.all(results.map(getPokemon))
        let pokemons = await Promise.all(pokemonList.map(getPokemonDetail))
        return pokemons;
    }else{
        let body = await fetch(confs.next);
        let response = await body.json()
        
        confs.next = response.next
        confs.previous = response.previous
        
        let results = response.results

        let pokemonList = await Promise.all(results.map(getPokemon))
        let pokemons = await Promise.all(pokemonList.map(getPokemonDetail))
        return pokemons;
    }
}

async function pokemonToModel(pokeDetail){
    const pokemon = new Pokemon();
    pokemon.number = pokeDetail.id;
    pokemon.name = pokeDetail.name;
    
    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
    const [type] = pokeDetail.types;

    pokemon.types = types;
    pokemon.type = type;
    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;
    return pokemon
}

async function createPokemons(){
    let pokemonsDetails = await makesRequest();
    let pokeModels = await Promise.all(pokemonsDetails.map(pokemonToModel));
    return pokeModels;
}

function pokemonToLi(pokemon){
    return `
    <li class="d-flex flex-column justify-content-between ${pokemon.type.type.name}">
    <div class="d-flex flex-row">
        <p class="number me-auto">${pokemon.number}</p>
    </div>
    <div class="d-flex justify-content-between">
        <p class="name">${pokemon.name}</p>
    </div>
    <div class="d-flex flex-row justify-content-between">
        <div class="align-self-center">
            <div class="type">${pokemon.type.type.name}</div>
        </div>
        <div>
            <img class="pokeImage" src=${pokemon.photo} alt="">
        </div>
    </div>
</li>
    
    `
}

async function pokemonsToLi(){
    let pokemons = await createPokemons();
    let pokemonLi = pokemons.map(pokemonToLi);
    return pokemonLi;
}

async function putPokemons(event){
    if(event){
        if(event.target.id === "next"){
            confs.target = "next"
        }else{
            confs.target = "previous"
        }
    }
    let pokemons = await pokemonsToLi();
    let container = document.getElementById('pokemons');
    container.innerHTML = '';
    pokemons.map((element) => {
        var item = document.createElement('span');
        item.innerHTML = element;
        container.appendChild(item);
    })
}

putPokemons()