import React, { Component } from 'react';
import { loadBreeds, searchByBreed } from '../../../services/dogApi';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import './Search.css';

const getSearch = location => location ? location.search : '';

export default class Search extends Component {
  
  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    onSearch: PropTypes.func.isRequired,
  };

  state = {
    dogs: [],
    breedList: [],
    error: null,
    breed: '',
    age: null,
    zip: null,
  };

  componentWillMount() {
    this.searchFromQuery(this.props.location);
    loadBreeds().then((body) => {
      this.setState({ breedList: body});
    });

  }

  UNSAFE_componentWillReceiveProps({ location }) {
    const next = getSearch(location);
    const breed = getSearch(this.props.location);
    if(breed === next) return;
    this.searchFromQuery(next);
  }
  
  searchFromQuery(query) {
    let search = query;
    if(typeof query.search === 'string') search = query.search;
    const { breed, location, age } = queryString.parse(search);
    this.setState({ breed, location, age });
    if(!breed || !location) return;

    this.props.onSearch([], null, true);

    searchByBreed(breed, location, age)
      .then(({ petfinder }) => {
        const results = petfinder.pets.pet;
        this.setState({ dogs: results });
      })
      .catch(error => {
        this.setState({ error });
      })
      .then(() => {
        this.props.onSearch(this.state.dogs, this.state.error, false);
      });
  }

  handleBreed = ({ target }) => {
    this.setState({ breed: target.value });
  };

  handleZip = ({ target }) => {
    this.setState({ zip: target.value });
  };

  handleAge = ({ target }) => {
    this.setState({ age: target.value });
  };

  handleSearch = () => {
    event.preventDefault();
    this.setState({ error: null });

    const searchString = {
      breed: this.state.breed,
      location: this.state.zip
    };

    if(this.state.age) searchString.age = this.state.age;
    
    this.props.history.push({
      search: searchString ? queryString.stringify(searchString) : ''
    });
  };
  
  render() {

    const { breedList, zip, age } = this.state;

    return (
      <form onSubmit={this.handleSearch}>
        <fieldset>
          <label htmlFor="zipcode"> Zipcode:</label>
          <input id="zipcode" type="text" placeholder="Zipcode" pattern="[0-9]{5}" value={zip} onChange={event => this.handleZip(event)} required />
          <div className="styled-select">
            <label htmlfor="age"> Dog Age: </label>
            <select id="age" onChange={event => this.handleAge(event)}>
              <option selected disabled>Age</option>
              <option value="Baby">Puppy</option>
              <option value="Young">Young</option>
              <option value="Adult">Adult</option>
              <option value="Senior">Senior</option>
              <option value="">All</option>
            </select>
          </div>
        </fieldset>
        <div className="styled-select">
          <label htmlfor="breed"> Choose Breed: </label>
          <select id="breed" onChange={event => this.handleBreed(event)} required>
            <option selected disabled>Breed</option>
            {breedList.map(breed => <option key={breed}>{breed}</option>)}
          </select>
        </div>
        <br/>
        <button>Search</button>
      </form>
    );
  }
}