"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import Modal from "./Modal";
import { Van } from "@/types";
import { Toaster, toast } from 'react-hot-toast';

const VanForm = () => {
  const [van, setVan] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [vanList, setVanList] = useState<Van[]>([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVan, setSelectedVan] = useState<Van | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const totalPages = Math.ceil(vanList.length / rowsPerPage);

  // Dropdown options
  const initialFuelOptions = ["Diesel", "Gasoline", "Electric", "Hybrid"];
  const initialMakeOptions = ["Toyota", "Nissan"];
  const initialBodyTypeOptions = ["Van", "Truck", "Sedan", "SUV"];
  const initialDenominationOptions = ["1.5L", "2.0L", "2.5L", "3.0L"];
  const initialPistonDisplacementOptions = ["1000cc", "1500cc", "2000cc", "2500cc"];

  const [fuelOptions, setFuelOptions] = useState(initialFuelOptions);
  const [makeOptions, setMakeOptions] = useState(initialMakeOptions);
  const [bodyTypeOptions, setBodyTypeOptions] = useState(initialBodyTypeOptions);
  const [denominationOptions, setDenominationOptions] = useState(initialDenominationOptions);
  const [pistonDisplacementOptions, setPistonDisplacementOptions] = useState(initialPistonDisplacementOptions);

  const [customOption, setCustomOption] = useState("");
  const [isCustomOptionVisible, setIsCustomOptionVisible] = useState(false);
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [vanIdToArchive, setVanIdToArchive] = useState<number | null>(null);

  useEffect(() => {
    const fetchVans = async () => {
      try {
        const response = await axios.get("/api/vans");
        setVanList(response.data);
      } catch (error) {
        console.error("Failed to fetch vans:", error);
      }
    };

    fetchVans();
  }, []);

  useEffect(() => {
    // Check if the current page has rows
    if (!hasRows(currentPage, rowsPerPage, vanList) && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, rowsPerPage, vanList]);

  // Function to check if the current page has rows
  const hasRows = (currentPage: number, rowsPerPage: number, data: Van[]) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex).length > 0;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const currentRows = vanList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRegisterModalClose = () => {
    setIsRegisterModalOpen(false);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setIsEditMode(false);
    setSelectedVan(null);
  };

  const handleView = (van: Van) => {
    setSelectedVan(van);
    setIsViewModalOpen(true);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  

  const handleRegisterChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const index = parseInt(name);
    setVan((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleCustomOptionChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomOption(event.target.value);
  };

  const handleCustomOptionSave = (optionType: string) => {
    switch (optionType) {
      case "fuel":
        setFuelOptions((prevOptions) => [...prevOptions, customOption]);
        setVan((prevVan) => {
          const updatedVan = [...prevVan];
          updatedVan[7] = customOption;
          return updatedVan;
        });
        break;
      case "piston_displacement":
        setPistonDisplacementOptions((prevOptions) => [...prevOptions, customOption]);
        setVan((prevVan) => {
          const updatedVan = [...prevVan];
          updatedVan[5] = customOption;
          return updatedVan;
        });
        break;
      case "denomination":
        setDenominationOptions((prevOptions) => [...prevOptions, customOption]);
        setVan((prevVan) => {
          const updatedVan = [...prevVan];
          updatedVan[4] = customOption;
          return updatedVan;
        });
        break;
        case "make":
        setMakeOptions((prevOptions) => [...prevOptions, customOption]);
        setVan((prevVan) => {
          const updatedVan = [...prevVan];
          updatedVan[8] = customOption;
          return updatedVan;
        });
        break;
      // Add cases for other dropdowns as needed
      default:
        break;
    }
    setCustomOption("");
    setIsCustomOptionVisible(false);
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/vans", {
        mv_file_no: van[0],
        plate_number: van[1],
        engine_no: van[2],
        chassis_no: van[3],
        denomination: van[4],
        piston_displacement: van[5],
        number_of_cylinders: van[6],
        fuel: van[7],
        make: van[8],
        series: van[9],
        body_type: van[10],
        body_no: van[11],
        year_model: van[12],
        gross_weight: van[13],
        net_weight: van[14],
        shipping_weight: van[15],
        net_capacity: van[16],
        year_last_registered: van[17],
        expiration_date: van[18],
      });
      toast.success("Van registered successfully");
      setVan([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
      const response = await axios.get("/api/vans");
      setVanList(response.data);
      handleRegisterModalClose();
    } catch (error) {
      console.error("Failed to register van:", error);
      toast.error("Failed to register van");
    }
  };

  const handleViewChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    if (selectedVan) {
      const { name, value } = e.target;
      setSelectedVan((prev) => ({
        ...prev!,
        [name]: value,
      }));
    }
  };
  

  const handleArchive = (van: Van) => {
    setVanIdToArchive(van.id);
    setIsConfirmArchiveOpen(true);
  };
  
  const handleViewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedVan) return;

    try {
      await axios.put(`/api/vans/${selectedVan.id}`, selectedVan);
      toast.success("Van updated successfully");
      const response = await axios.get("/api/vans");
      setVanList(response.data);
      handleViewModalClose();
    } catch (error) {
      console.error("Failed to update van:", error);
      toast.error("Failed to update van");
    }
  };

  const confirmArchiveVan = async () => {
    if (vanIdToArchive === null) return;

    try {
      const response = await axios.delete(`/api/vans`, {
        data: { id: vanIdToArchive }
      });

      if (response.status === 200) {
        toast.success("Van archived successfully");
        setVanList((prev) =>
          prev.filter((v) => v.id !== vanIdToArchive)
        );
        setIsConfirmArchiveOpen(false);
      } else {
        toast.error('Failed to archive van');
      }
    } catch (error: any) {
      console.error('Error during archive:', error.response?.data || error.message);
      toast.error('Failed to archive van');
    }
  };



  

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mt-6">
      <button onClick={() => setIsRegisterModalOpen(true)} 
         className="bg-blue-500 text-white font-light text-sm px-4 selection:
         py-2 rounded-md ml-auto flex items-center  sm:mb-6
          hover:bg-blue-600 transition duration-300">
         
        Register New Van
      </button>
      </div>
      

       {/* Register Modal */}
    <Modal isOpen={isRegisterModalOpen} onClose={handleRegisterModalClose} title="Register Modal">
      <form onSubmit={handleRegisterSubmit} className="space-y-8 p-2 sm:p-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="plate_number">Plate Number</label>
          <input type="text" name="1" value={van[1]} onChange={handleRegisterChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="engine_no">Engine No</label>
          <input type="text" name="2" value={van[2]} onChange={handleRegisterChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="chassis_no">Chassis No</label>
          <input type="text" name="3" value={van[3]} onChange={handleRegisterChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="make">Make</label>
          <select name="8" value={van[8]} onChange={handleRegisterChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase">
            <option value="">Select Make</option>
            {makeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
            <option value="other">Other</option>
          </select>
          {van[8] === "other" && (
            <div className="mt-2 flex">
              <input type="text" value={customOption} onChange={handleCustomOptionChange} placeholder="Enter new make" className="border p-2 flex-grow" />
              <button type="button" onClick={() => handleCustomOptionSave("make")} className="ml-2 p-2 bg-blue-500 text-white">Save</button>
            </div>
          )}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="year_last_registered">Year Last Registered</label>
          <input type="number" name="17" value={van[17]} onChange={handleRegisterChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" min="1900" max={new Date().getFullYear()} placeholder="YYYY" />
        </div>
        <div className="flex justify-end space-x-4">
          <button type="submit" className="border-2 px-5 border-transparent text-white bg-blue-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-blue-600 hover:text-blue-700 transition-colors duration-300">
            
            save
          </button>
          <button type="button" onClick={handleRegisterModalClose} className="border-2 border-transparent text-white bg-red-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-red-600 hover:text-red-700 transition-colors duration-300">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
      
      <div className="p-4 sm:p-6 lg:p-8 " style={{marginLeft:'12.5rem',marginTop:'-9rem'}}>
          <h2 className="text-2xl font-normal text-gray-600 ">Manage Vans</h2>
          <p className="text-gray-500 dark:text-gray-400">View, register, and update van details</p>
        </div>


      <h2>Registered Vans</h2>
      <div className="flex justify-start min-w-full overflow-x-auto relative mt-[-0.5rem]">
      <table className="bg-white rounded-lg overflow-hidden w-full" style={{ tableLayout: 'fixed', marginLeft: '220px' }}>
  <thead className="bg-blue-400 text-xs">
    <tr className="text-white">
     
      <th className="px-4 py-2 w-32 text-left font-normal rounded-l-lg">Plate Number</th>
      <th className="px-4 py-2 w-32 text-left font-normal">Engine No</th>
      <th className="px-4 py-2 w-32 text-left font-normal">Chassis No</th>
      <th className="px-4 py-2 w-32 text-left font-normal">Make</th>
      <th className="px-4 py-2 w-32 text-center font-normal">Year Last Registered</th>
      <th className="px-4 py-2 w-32 text-center font-normal rounded-r-lg">Actions</th>
    </tr>
  </thead>
  <tbody className="text-xs">
    {currentRows.length === 0 ? (
      <tr>
        <td colSpan={10} className="px-4 py-52 text-center text-lg font-medium text-gray-400">
          No Van Registered
        </td>
      </tr>
    ) : (
      currentRows.map((v, index) => (
        <tr key={index} className="border-b">
         
          <td className="px-4 py-2 uppercase" style={{ wordBreak: 'break-word' }}>{v.plate_number}</td>
          <td className="px-2 py-2 uppercase " style={{ wordBreak: 'break-word' }}>{v.engine_no}</td>
          <td className="px-4 py-2 uppercase " style={{ wordBreak: 'break-word' }}>{v.chassis_no}</td>
          
          <td className="px-3 py-2 uppercase " style={{ wordBreak: 'break-word' }}>{v.make}</td>
          <td className="px-4 py-2 uppercase text-center">{v.year_last_registered}</td>
          <td className="px-16 py-2 uppercase ">
            <div className="flex gap-2 ">
              <button
                onClick={() => handleView(v)}
                className="relative border border-green-400 text-green-400 p-2 rounded-md flex items-center justify-center bg-transparent hover:bg-green-400 hover:text-white transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  className="stroke-current text-green-400 hover:text-white transition-colors duration-300"
                  fill="none"
                >
                  <path d="M16.2141 4.98239L17.6158 3.58063C18.39 2.80646 19.6452 2.80646 20.4194 3.58063C21.1935 4.3548 21.1935 5.60998 20.4194 6.38415L19.0176 7.78591M16.2141 4.98239L10.9802 10.2163C9.93493 11.2616 9.41226 11.7842 9.05637 12.4211C8.70047 13.058 8.3424 14.5619 8 16C9.43809 15.6576 10.942 15.2995 11.5789 14.9436C12.2158 14.5877 12.7384 14.0651 13.7837 13.0198L19.0176 7.78591M16.2141 4.98239L19.0176 7.78591" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682C3 18.364 3 16.2426 3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                </svg>
                <div className="absolute bottom-full mb-2 hidden text-xs text-white bg-green-400 p-1 rounded-md tooltip">
                  View/Edit
                </div>
              </button>
              <style jsx>{` .relative:hover .tooltip { display: block; } `}</style>

              <button
                onClick={() => handleArchive(v)}
                className="relative border border-red-500 text-red-500 p-2 rounded-md flex items-center justify-center bg-transparent hover:bg-red-500 hover:text-white transition-colors duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  className="stroke-current text-red-500 hover:text-white transition-colors duration-300"
                  fill="none"
                >
                  <path d="M14 22H9.62182C7.27396 22 6.10003 22 5.28565 21.2945C4.47127 20.5889 4.27181 19.3991 3.87289 17.0194L2.66933 9.83981C2.48735 8.75428 2.39637 8.21152 2.68773 7.85576C2.9791 7.5 3.51461 7.5 4.58564 7.5H19.4144C20.4854 7.5 21.0209 7.5 21.3123 7.85576C21.6036 8.21152 21.5126 8.75428 21.3307 9.83981L21.0524 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  <path d="M17.5 7.5C17.5 4.46243 15.0376 2 12 2C8.96243 2 6.5 4.46243 6.5 7.5" stroke="currentColor" stroke-width="1.5" />
                  <path d="M16.5 16.5C16.9915 15.9943 18.2998 14 19 14M21.5 16.5C21.0085 15.9943 19.7002 14 19 14M19 14V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div className="absolute bottom-full mb-2 hidden text-xs text-white bg-red-500 p-1 rounded-md tooltip">
                  Archive
                </div>
              </button>
              <style jsx>{`.relative:hover .tooltip { display: block; } `}</style>
            </div>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>
{/* Confirm Archive Modal */}
{isConfirmArchiveOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-red-100 p-4 rounded-lg shadow-lg w-full max-w-sm mx-auto">
            <div className="flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700" role="alert">
              <svg className="w-5 h-5 inline mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <div>
                <span className="font-medium">Confirm Archive</span> Are you sure you want to archive this van?
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={confirmArchiveVan}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setIsConfirmArchiveOpen(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <nav className="pagination-bottom flex items-center -space-x-px ml-[700px] mb-10" aria-label="Pagination">
        <button
          type="button"
          className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center 
          items-center gap-x-1.5 text-sm first:rounded-s-lg last:rounded-e-lg border border-blue-300
          text-gray-800 hover:bg-blue-500 hover:text-white focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Previous"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
          <span className="hidden sm:block">Previous</span>
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            type="button"
            className={`min-h-[38px] min-w-[38px] flex justify-center items-center border border-blue-300
              py-2 px-3 text-sm first:rounded-s-lg last:rounded-e-lg focus:outline-none
              ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'text-gray-800 hover:text-white hover:bg-blue-500'}`}
            aria-current={currentPage === index + 1 ? 'page' : undefined}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          type="button"
          className="min-h-[38px] min-w-[38px] py-2 px-2.5 inline-flex justify-center items-center
          gap-x-1.5 text-sm first:rounded-s-lg last:rounded-e-lg border border-blue-300 text-gray-800
          hover:bg-blue-500 hover:text-white  focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
          aria-label="Next"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:block">Next</span>
          <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
      </nav>
    </div>

     {/* View/Edit Modal */}
{isViewModalOpen && selectedVan && (
  <Modal isOpen={isViewModalOpen} onClose={handleViewModalClose} title={isEditMode ? "Edit Van" : "View Van"}>
    <form onSubmit={isEditMode ? handleViewSubmit : (e) => e.preventDefault()} className="space-y-8 p-2 sm:p-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="plate_number">Plate Number</label>
          <input type="text" name="plate_number" value={selectedVan.plate_number} onChange={handleViewChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" disabled={!isEditMode} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="engine_no">Engine No</label>
          <input type="text" name="engine_no" value={selectedVan.engine_no} onChange={handleViewChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" disabled={!isEditMode} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="chassis_no">Chassis No</label>
          <input type="text" name="chassis_no" value={selectedVan.chassis_no} onChange={handleViewChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" disabled={!isEditMode} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="make">Make</label>
          <select name="make" value={selectedVan.make} onChange={handleViewChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" disabled={!isEditMode}>
            <option value="">Select Make</option>
            {makeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 uppercase" htmlFor="year_last_registered">Year Last Registered</label>
          <input type="number" name="year_last_registered" value={selectedVan.year_last_registered} onChange={handleViewChange} className="bg-gray-50 border-2 border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 placeholder-gray-400 focus:border-green-600 focus:outline-none uppercase" disabled={!isEditMode} />
        </div>
      </div>
      <div className="flex space-x-4 justify-end">
      {!isEditMode && (
        <button onClick={handleEdit} className="border-2 border-transparent text-white bg-blue-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-blue-600 hover:text-blue-700 transition-colors duration-300">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="stroke-current" fill="none">
              <path d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M13 4L20 11" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              <path d="M14 22L22 22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          Edit
        </button>
      )}
      {isEditMode && (
        <button type="submit"  className="border-2 border-transparent text-white bg-blue-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-blue-600 hover:text-blue-700 transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="stroke-current" fill="none">
              <path d="M17.4776 9.01106C17.485 9.01102 17.4925 9.01101 17.5 9.01101C19.9853 9.01101 22 11.0294 22 13.5193C22 15.8398 20.25 17.7508 18 18M17.4776 9.01106C17.4924 8.84606 17.5 8.67896 17.5 8.51009C17.5 5.46695 15.0376 3 12 3C9.12324 3 6.76233 5.21267 6.52042 8.03192M17.4776 9.01106C17.3753 10.1476 16.9286 11.1846 16.2428 12.0165M6.52042 8.03192C3.98398 8.27373 2 10.4139 2 13.0183C2 15.4417 3.71776 17.4632 6 17.9273M6.52042 8.03192C6.67826 8.01687 6.83823 8.00917 7 8.00917C8.12582 8.00917 9.16474 8.38194 10.0005 9.01101" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 21L12 13M12 21C11.2998 21 9.99153 19.0057 9.5 18.5M12 21C12.7002 21 14.0085 19.0057 14.5 18.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          Update Van
        </button>
      )}
        <button onClick={handleViewModalClose} className="border-2 border-transparent text-white bg-red-500 p-2 rounded-lg flex items-center justify-center hover:bg-transparent hover:border-2 hover:border-red-600 hover:text-red-700 transition-colors duration-300">
          <span>Cancel</span>
        </button>
      </div>
    </form>
  </Modal>
)}
    </div>
  );
};

export default VanForm;
