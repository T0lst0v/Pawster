import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import { data } from "./data";

import * as actionCreators from "../../store/action_creators/filterActionCreator";
import CardServiceComponent from "./CardServiceComponent";
import CardWeightsComponent from "./CardWeightsComponent";

const mapDispatchToProps = (dispatch) => {
  return {
    onToggleService: (value) => dispatch(actionCreators.toggleService(value)),
  };
};

function ServiceOptions(props) {
  const [selectedService, setSelectedService] = useState(data.services[0]);
  const [selectedWeight, setSelectedWeight] = useState([]);
  props.onToggleService({ [selectedService.name]: true });
  console.log(selectedService.label);
  return (
    <div className="rounded overflow-hidden bg-background-light border border-slate-300 m-4">
      {/* TODO: filter by Dog and Cat  services   */}
      <div className="flex flex-row py-2 px-6 gap-2 items-center bg-background-darker">
        <p>I'm looking for service for my:</p>
        <label htmlFor="dog-services" className="inline text-base text-black">
          Dog
        </label>
        <input type="checkbox" className=" inline" id="dog-services" />
        <label htmlFor="cat-services" className="inline text-base text-black">
          Cat
        </label>
        <input type="checkbox" className=" inline" id="cat-services" />
      </div>
      <div>
        <CardServiceComponent selectedService={selectedService} setSelectedService={setSelectedService} />

        <div className="mx-6 mb-5">
          <label className=" text-base mx-2">{selectedService.label} near:</label>
          <input type="text" placeholder="Address or zip code" className=" text-center" />
        </div>
        <label className="text-left text-sm px-8">My pet Size:</label>
        <div className="flex flex-row gap-4 px-6 pb-8 justify-items-stretch">
          <CardWeightsComponent selectedWeight={selectedWeight} setSelectedWeight={setSelectedWeight} />
          <button className=" bg-accent-green text-white flex-1 text-lg">
            <NavLink to="/search" className="hover:text-white">
              Search
            </NavLink>
          </button>
        </div>
      </div>
    </div>
  );
}

export default connect(null, mapDispatchToProps)(ServiceOptions);
