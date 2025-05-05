import React, { useState, useRef, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const LeadAssign = () => {
  // Navigation hook for routing
  const navigate = useNavigate();

  // State for dropdown open/close
  const [serviceLeadOpen, setServiceLeadOpen] = useState(false);
  const [serviceTeamOpen, setServiceTeamOpen] = useState(false);
  const [kitchenMembersOpen, setKitchenMembersOpen] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState(null);

  // State for dropdown selections
  const [serviceLeadSelected, setServiceLeadSelected] = useState([]);
  const [serviceTeamSelected, setServiceTeamSelected] = useState([]);
  const [kitchenMembersSelected, setKitchenMembersSelected] = useState([]);

  // State for search terms in each dropdown
  const [serviceLeadSearch, setServiceLeadSearch] = useState("");
  const [serviceTeamSearch, setServiceTeamSearch] = useState("");
  const [kitchenMembersSearch, setKitchenMembersSearch] = useState("");

  // State for tools input
  const [toolName, setToolName] = useState("");
  const [toolQty, setToolQty] = useState("");
  const [toolsList, setToolsList] = useState([]);

  // Refs for dropdown containers
  const serviceLeadRef = useRef(null);
  const serviceTeamRef = useRef(null);
  const kitchenMembersRef = useRef(null);

  const [mediaFile, setMediaFile] = useState(null); // New state for file upload

  // Sample data for dropdowns
  const serviceLeads = ["Riyaz ", "Ateeq", "Nazim", "Barik", "Shariq"];
  const serviceTeamMembers = ["Riyaz ", "Ateeq", "Nazim", "Barik", "Shariq"];
  const kitchenMembers = ["Israiel", "Chef Nisar", "Inaam", "Javed", "Sajid"];

  // Function to add a tool to the list
  const addTool = () => {
    if (toolName && toolQty > 0) {
      setToolsList([
        ...toolsList,
        {
          name: toolName,
          qty: toolQty,
          media: mediaFile ? mediaFile.url : null,
        },
      ]);
      setToolName("");
      setToolQty("");
      setMediaFile(null); // Reset file input
    }
  };

  const deleteTool = (indexToDelete) => {
    const updatedTools = [...toolsList];
    updatedTools.splice(indexToDelete, 1);
    setToolsList(updatedTools);
  };

  // Function to handle keypress in tools input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTool();
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      ["image/", "video/", "audio/"].some((type) => file.type.startsWith(type))
    ) {
      const fileURL = URL.createObjectURL(file); // Create a temporary URL for the file
      setMediaFile({ file, url: fileURL });
    } else {
      alert("Please upload a valid image, video, or audio file.");
    }
  };

  // Function to toggle selection of an item
  const toggleSelection = (item, currentList, setListFunction) => {
    if (currentList.includes(item)) {
      setListFunction(currentList.filter((i) => i !== item));
    } else {
      setListFunction([...currentList, item]);
    }
  };

  // Function to handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        serviceLeadRef.current &&
        !serviceLeadRef.current.contains(event.target)
      ) {
        setServiceLeadOpen(false);
      }
      if (
        serviceTeamRef.current &&
        !serviceTeamRef.current.contains(event.target)
      ) {
        setServiceTeamOpen(false);
      }
      if (
        kitchenMembersRef.current &&
        !kitchenMembersRef.current.contains(event.target)
      ) {
        setKitchenMembersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to handle saving assignment and navigating to CheckList
  const handleSaveAssignment = () => {
    // Create a formatted checklist from toolsList
    const checklistData = toolsList.map((tool, index) => ({
      id: index + 1,
      name: tool.name,
      assetLink: tool.media || "assets/default",
      qty: parseInt(tool.qty),
      status: "Pending",
      receivedQty: 0,
      remark: "",
    }));

    // Save data to localStorage so CheckList component can access it
    localStorage.setItem(
      "checklistData",
      JSON.stringify({
        serviceLead: serviceLeadSelected,
        serviceTeam: serviceTeamSelected,
        kitchenMembers: kitchenMembersSelected,
        tools: checklistData,
      })
    );

    // Navigate to the CheckList page
    navigate("/checklist");
  };

  // Sort tools alphabetically by name
  // const sortedTools = [...toolsList].sort((a, b) =>
  //   a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  // );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-left">
          Lead Assignment
        </h1>

        <div className="space-y-4">
          {/* Dropdowns (unchanged) */}
          <div className="flex flex-1 gap-4">
            {/* Service Lead Dropdown */}
            <div ref={serviceLeadRef} className="relative flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Service Lead
              </label>
              <div
                className="w-full bg-white border border-gray-300 rounded-lg flex items-center justify-between p-3 cursor-pointer hover:border-blue-500 transition-all"
                onClick={() => setServiceLeadOpen(!serviceLeadOpen)}
              >
                <span
                  className={
                    serviceLeadSelected.length === 0
                      ? "text-gray-400"
                      : "text-gray-800"
                  }
                >
                  {serviceLeadSelected.length === 0
                    ? "Select Service Lead"
                    : `${serviceLeadSelected.length} Lead(s) Selected`}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    serviceLeadOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
              {serviceLeadOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search service leads..."
                      value={serviceLeadSearch}
                      onChange={(e) => setServiceLeadSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {serviceLeads
                      .filter((lead) =>
                        lead
                          .toLowerCase()
                          .includes(serviceLeadSearch.toLowerCase())
                      )
                      .map((lead, index) => (
                        <div
                          key={index}
                          className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center ${
                            serviceLeadSelected.includes(lead)
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(
                              lead,
                              serviceLeadSelected,
                              setServiceLeadSelected
                            );
                          }}
                        >
                          <div
                            className={`w-5 h-5 border mr-3 flex items-center justify-center ${
                              serviceLeadSelected.includes(lead)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {serviceLeadSelected.includes(lead) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            )}
                          </div>
                          {lead}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {serviceLeadSelected.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {serviceLeadSelected.map((lead, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {lead}
                      <button
                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                        onClick={() =>
                          toggleSelection(
                            lead,
                            serviceLeadSelected,
                            setServiceLeadSelected
                          )
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Team Dropdown (unchanged) */}
            <div ref={serviceTeamRef} className="relative flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Service Team
              </label>
              <div
                className="w-full bg-white border border-gray-300 rounded-lg flex items-center justify-between p-3 cursor-pointer hover:border-blue-500 transition-all"
                onClick={() => setServiceTeamOpen(!serviceTeamOpen)}
              >
                <span
                  className={
                    serviceTeamSelected.length === 0
                      ? "text-gray-400"
                      : "text-gray-800"
                  }
                >
                  {serviceTeamSelected.length === 0
                    ? "Select Service Team"
                    : `${serviceTeamSelected.length} Member(s) Selected`}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    serviceTeamOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
              {serviceTeamOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search service team members..."
                      value={serviceTeamSearch}
                      onChange={(e) => setServiceTeamSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {serviceTeamMembers
                      .filter((member) =>
                        member
                          .toLowerCase()
                          .includes(serviceTeamSearch.toLowerCase())
                      )
                      .map((member, index) => (
                        <div
                          key={index}
                          className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center ${
                            serviceTeamSelected.includes(member)
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(
                              member,
                              serviceTeamSelected,
                              setServiceTeamSelected
                            );
                          }}
                        >
                          <div
                            className={`w-5 h-5 border mr-3 flex items-center justify-center ${
                              serviceTeamSelected.includes(member)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {serviceTeamSelected.includes(member) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            )}
                          </div>
                          {member}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {serviceTeamSelected.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {serviceTeamSelected.map((member, index) => (
                    <div
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {member}
                      <button
                        className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                        onClick={() =>
                          toggleSelection(
                            member,
                            serviceTeamSelected,
                            setServiceTeamSelected
                          )
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kitchen Members Dropdown (unchanged) */}
            <div ref={kitchenMembersRef} className="relative flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                Kitchen Team
              </label>
              <div
                className="w-full bg-white border border-gray-300 rounded-lg flex items-center justify-between p-3 cursor-pointer hover:border-blue-500 transition-all"
                onClick={() => setKitchenMembersOpen(!kitchenMembersOpen)}
              >
                <span
                  className={
                    kitchenMembersSelected.length === 0
                      ? "text-gray-400"
                      : "text-gray-800"
                  }
                >
                  {kitchenMembersSelected.length === 0
                    ? "Select Kitchen Members"
                    : `${kitchenMembersSelected.length} Member(s) Selected`}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    kitchenMembersOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
              {kitchenMembersOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search kitchen members..."
                      value={kitchenMembersSearch}
                      onChange={(e) => setKitchenMembersSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {kitchenMembers
                      .filter((member) =>
                        member
                          .toLowerCase()
                          .includes(kitchenMembersSearch.toLowerCase())
                      )
                      .map((member, index) => (
                        <div
                          key={index}
                          className={`p-3 cursor-pointer hover:bg-gray-100 flex items-center ${
                            kitchenMembersSelected.includes(member)
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(
                              member,
                              kitchenMembersSelected,
                              setKitchenMembersSelected
                            );
                          }}
                        >
                          <div
                            className={`w-5 h-5 border mr-3 flex items-center justify-center ${
                              kitchenMembersSelected.includes(member)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {kitchenMembersSelected.includes(member) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            )}
                          </div>
                          {member}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {kitchenMembersSelected.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {kitchenMembersSelected.map((member, index) => (
                    <div
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {member}
                      <button
                        className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
                        onClick={() =>
                          toggleSelection(
                            member,
                            kitchenMembersSelected,
                            setKitchenMembersSelected
                          )
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tools Input Section */}
          <div className="mt-8">
            <label className="block text-gray-700 font-medium mb-2">
              Tools
            </label>
            <div className="flex gap-4">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tool name"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <input
                  type="file"
                  accept="image/*,video/*,audio/*"
                  className="p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="QTY"
                  value={toolQty}
                  onChange={(e) => setToolQty(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <button
                className="bg-gray-600 text-white px-5 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={addTool}
              >
                Add
              </button>
            </div>
          </div>

          {/* Tools List */}
          {toolsList.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-4">
                Tools List
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-12 text-sm font-medium text-gray-600">
                    <div className="col-span-4">Tool Name</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-3 text-center">Link to Media</div>
                    <div className="col-span-3 text-center">Action</div>
                  </div>
                </div>
                {/* Tool Rows */}
                <div className="divide-y divide-gray-100 max-h-[250px] overflow-y-scroll">
                  {toolsList.map((tool, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50 text-sm"
                    >
                      <div className="col-span-4 font-medium text-gray-800">
                        {tool.name}
                      </div>
                      <div className="col-span-2 text-center text-gray-700">
                        {tool.qty}
                      </div>
                      <div className="col-span-3 text-center">
                        {tool.media ? (
                          <a
                            href={tool.media}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View Media
                          </a>
                        ) : (
                          "No Media"
                        )}
                      </div>
                      <div className="col-span-3 flex justify-center relative">
                        {confirmDeleteIndex === index ? (
                          <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-md p-3 flex flex-col gap-2 w-48">
                            <p className="text-sm text-gray-800">
                              Are you sure?
                            </p>
                            <div className="flex justify-between">
                              <button
                                onClick={() => {
                                  deleteTool(index);
                                  setConfirmDeleteIndex(null);
                                }}
                                className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteIndex(null)}
                                className="text-gray-600 hover:text-black text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteIndex(index)}
                            className="flex items-center gap-1 text-red-500 hover:text-white hover:bg-red-500 p-1 rounded-full transition-all duration-200 text-sm font-semibold"
                          >
                            <MdDelete className="text-lg" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button - Updated with onClick handler */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleSaveAssignment}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAssign;
