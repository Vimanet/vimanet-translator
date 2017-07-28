import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  templateUrl: 'app/error/error.component.html'
})
export class ErrorComponent implements OnInit {

  routeSubscription: Subscription;
  errorMessage: string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.errorMessage = params['message'] || 'Unknown error has occured.';
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}