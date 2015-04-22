/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var google = require('googleapis');

var customsearch = google.customsearch('v1');

// You can get a custom search engine id at
// https://www.google.com/cse/create/new
const CX = process.env.GOOGLE_CX_ID;
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SEARCH = 'maps';

customsearch.cse.list({ cx: CX, q: SEARCH, auth: API_KEY }, function(err, resp) {
  if (err) {
    console.log('An error occured', err);
    return;
  }
  // Got the response from custom search
  console.log('Result: ' + resp.searchInformation.formattedTotalResults);
  if (resp.items && resp.items.length > 0) {
    console.log('First result name is ' + resp.items[0].title);
  }
});
