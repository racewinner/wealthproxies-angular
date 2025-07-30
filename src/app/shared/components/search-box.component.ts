import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

/**
 * @title Filter autocomplete
 */
@Component({
  selector: 'autocomplete-filter-example',
  templateUrl: 'autocomplete-filter-example.html',
  styleUrls: ['autocomplete-filter-example.css'],
  standalone: true, // <-- this line is important

})
export class AutocompleteFilterExample implements OnInit {
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
//   filteredOptions: Observable<string[]>;

  ngOnInit() {
    // this.filteredOptions = this.myControl.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map(value => this._filter(value))
    //   );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}


/**  Copyright 2018 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */