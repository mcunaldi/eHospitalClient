import { AfterViewInit, Component, OnInit } from '@angular/core';

import { DxSchedulerModule } from 'devextreme-angular';
import { UserModel } from '../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppointmentModel } from '../models/appointment.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DxSchedulerModule,
    FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit{
  appointmentsData: any[] = [];
  
  selectedDoctorId: string = "";
  currentDate: Date = new Date();

  doctors: UserModel[] = [];

  appointment: AppointmentModel[] = [];

  appointmentButton = document.querySelector("[aria-label='Done']");

  data: AppointmentModel[] = [];

  constructor(
    private http: HttpClient) { }

    ngAfterViewInit(): void {
      
    }

  ngOnInit(): void {
    this.getAllDoctors();
  }

  addAppointment() {
    const appointmentButton = document.querySelector("[aria-label='Done']"); // More specific selector
    //const selectedDateElement = document.querySelector("#dx_dx-35c44d61-e72e-b1dd-5a9c-932c110b29a9_startDate");
    //const selectedDate = selectedDateElement?.ariaValueText; // Use .value instead of .ariaValueText
    const selectedDateElement = document.querySelector("startDate") as HTMLInputElement;
    const selectedDate = selectedDateElement?.value; 
    const dateStart = new Date(selectedDate);
  
    const selectedEndDateElement = document.querySelector("endDate") as HTMLInputElement;
    const selectedEndDate = selectedEndDateElement?.value; // Use .value instead of .ariaValueText
    const dateEnd = new Date(selectedEndDate);
  
    if (appointmentButton) {
      appointmentButton.addEventListener('click', () => {
        this.createAppointment(selectedDate, selectedEndDate);
      });
    } else {
      console.log('Appointment button not found. Functionality may be limited.');
    }
  }
  
  createAppointment(dateStart : any, dateEnd : any) {
    this.http.post("http://localhost:5019/api/Appointments/CreateAppointment", {
      doctorId: "da70ae26-04a0-46be-9d0a-12b26d88f562",
      patientId: "0ec07cfc-2dc2-4339-a48c-613b6d1d3c42",
      startDate: dateStart,
      endDate: dateEnd,
      epicrisisReport: "",
      price: 0,
    }).subscribe({
      next: (res: any) => {
        console.log("Appointment created successfully");
      },
      error: (err: HttpErrorResponse) => {
        console.log("Failed to create appointment:", err);
      }
    });
  }
  getAllDoctors() {
    this.http.get("http://localhost:5019/api/Doctors/GetAllDoctors").subscribe((res: any) => {
      this.doctors = res.data;
    })
  }

  getDoctorAppointments() {
    if (this.selectedDoctorId === "") return;

    this.http.get(`http://localhost:5019/api/Appointments/GetAllByDoctorId?doctorId=${this.selectedDoctorId}`).subscribe((res:any)=> {

      const data = res.data.map((val: any, i: number)=> {
        return {
          text: val.patient.fullName,
          startDate: val.startDate,
          endDate: val.endDate
        };
      });

      this.appointmentsData = data;
    })
  }
}