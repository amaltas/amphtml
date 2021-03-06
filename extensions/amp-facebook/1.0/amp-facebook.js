/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {BaseElement} from './base-element';
import {createLoaderLogo} from '../0.1/facebook-loader';
import {dashToUnderline} from '#core/types/string';
import {dict} from '#core/types/object';
import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-facebook';
const TYPE = 'facebook';

class AmpFacebook extends BaseElement {
  /** @override @nocollapse */
  static createLoaderLogoCallback(element) {
    return createLoaderLogo(element);
  }

  /** @override @nocollapse */
  static getPreconnects(element) {
    const ampdoc = element.getAmpDoc();
    const {win} = ampdoc;
    const locale = element.hasAttribute('data-locale')
      ? element.getAttribute('data-locale')
      : dashToUnderline(window.navigator.language);
    return [
      // Base URL for 3p bootstrap iframes
      getBootstrapBaseUrl(win, ampdoc),
      // Script URL for iframe
      getBootstrapUrl(TYPE, win),
      'https://facebook.com',
      // This domain serves the actual tweets as JSONP.
      'https://connect.facebook.net/' + locale + '/sdk.js',
    ];
  }

  /** @override */
  init() {
    return dict({
      'onReady': () => this.togglePlaceholder(false),
      'requestResize': (height) => this.forceChangeHeight(height),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-facebook'),
      'expected global "bento" or specific "bento-facebook" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/**
 * Checks for valid data-embed-as attribute when given.
 * @param {!Element} element
 * @return {string}
 */
function parseEmbed(element) {
  const embedAs = element.getAttribute('data-embed-as');
  userAssert(
    !embedAs || ['post', 'video', 'comment'].indexOf(embedAs) !== -1,
    'Attribute data-embed-as for <amp-facebook> value is wrong, should be' +
      ' "post", "video" or "comment" but was: %s',
    embedAs
  );
  return embedAs;
}

/** @override */
AmpFacebook['props'] = {
  ...BaseElement['props'],
  'embedAs': {
    attrs: ['data-embed-as'],
    parseAttrs: parseEmbed,
  },
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFacebook);
});
