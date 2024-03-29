import { AfterViewInit, Component, OnInit } from '@angular/core';
import { DxSchedulerModule } from 'devextreme-angular';
import { UserModel } from '../models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { AppointmentModel } from '../models/appointment.model';
import { ResultModel } from '../models/result.mode';
import { CommonModule } from '@angular/common';
import { FormValidateDirective } from 'form-validate-angular';
import { AppointmentDataModel } from '../models/appointment-data';
declare const $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    DxSchedulerModule,
    FormsModule,
    FormValidateDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  appointmentsData: any[] = [];
  selectedDoctorId: string = "";
  currentDate: Date = new Date();
  doctors: UserModel[] = [];

  addModel: AppointmentModel = new AppointmentModel();
  appointmentData: AppointmentDataModel = new AppointmentDataModel();


  constructor(
    private http: HttpClient) { }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.getAllDoctors();
  }

  addAppointment() { }

  getAllDoctors() {
    this.http.get("http://localhost:5019/api/Appointments/GetAllDoctors").subscribe((res: any) => {
      this.doctors = res.data;
    })
  }

  getDoctorAppointments() {
    if (this.selectedDoctorId === "") return;

    this.http.get(`http://localhost:5019/api/Appointments/GetAllByDoctorId?doctorId=${this.selectedDoctorId}`).subscribe((res: any) => {

      const data = res.data.map((val: any, i: number) => {
        return {
          text: val.patient.fullName,
          startDate: val.startDate,
          endDate: val.endDate
        };
      });

      this.appointmentsData = data;
    })
  }


  onAppointmentFormOpening(event: any) {
    console.log(event);
    this.appointmentData = event.appointmentData;
    const doctorName = this.doctors.find(p=> p.id == this.selectedDoctorId)?.fullName;
    const specialtyName = this.doctors.find(p=> p.id == this.selectedDoctorId)?.doctorDetail?.specialtyName;

    this.appointmentData.doctorName = `${doctorName} - ${specialtyName}`
    event.cancel = true;
    $("#addAppointmentModal").modal('show');
  }

  add(form: NgForm) {
    if (form.valid) {
      const patientId = this.addModel.patient.id === "" ? null : this.addModel.patient.id;
      const data = {
        "doctorId": this.selectedDoctorId,
        "patientId": patientId,
        "firstName": this.addModel.patient.firstName,
        "lastName": this.addModel.patient.lastName,
        "fullAddress": this.addModel.patient.fullAddress,
        "email": this.addModel.patient.email,
        "phoneNumber": this.addModel.patient.phoneNumber,
        "identityNumber": this.addModel.patient.identityNumber,
        "dateOfBirth": this.addModel.patient.dateOfBirth,
        "bloodType": this.addModel.patient.bloodType,
        "startDate": this.appointmentData.startDate,
        "endDate": this.appointmentData.endDate,
        "price": this.doctors.find(p=> p.id == this.addModel.doctorId)?.doctorDetail?.price
      };

      this.http.post(`http://localhost:5019/api/Appointments/Create`, data).subscribe(res=> {
        $("#addAppointmentModal").modal('hide');
        this.getDoctorAppointments();
        this.addModel = new AppointmentModel();
      });
      
    }
  }

  findPatientByIdentityNumber() {
    if (this.addModel.patient.identityNumber.length < 11) return;

    this.http.post<ResultModel<UserModel>>(`http://localhost:5019/api/Appointments/FindPatientByIdentityNumber`, {
      identityNumber: this.addModel.patient.identityNumber
    })
    .subscribe((res) => {
      if (res.data !== undefined && res.data !== null) {
        this.addModel.patient = res.data;
        }
      })
  }
}