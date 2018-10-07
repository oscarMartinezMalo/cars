import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {

  constructor(private auth: AuthService) { }


  updateUserName ={ 
    firstName:'',
    lastName:''
  } as {};
  

  updateUserPassword = {    
    password:'',
    newPassword:'',
    confirmPassword:''
  }

  ngOnInit() {
   this.auth.getUserInfo();
   this.auth.userCompName.subscribe(resp=>{     
     this.updateUserName = resp;
   })
  }

  updateName(){   
    this.auth.updateUserInfo(this.updateUserName);
  }

  updatePassword(){
    this.auth.updatePassword(this.updateUserPassword);
  }

}
