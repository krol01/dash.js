﻿/*
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * copyright Digital Primates 2012
 */
Stream.rules.BandwidthRule = (function () {
    "use strict";

    var Constr;

    Constr = function () {

    };

    Stream.utils.inherit(Constr, Stream.rules.BaseRule);

    Constr.prototype = {
        constructor: Stream.rules.BandwidthRule,
        checkIndex: function (metrics, items) {
            if (!metrics) {
                return -1;
            }
            
            var debug = Stream.modules.debug,
                newIdx = -1,
                downloadRatio = metrics.lastFragmentDuration / metrics.lastFragmentDownloadTime,
                switchRatio;

            debug.log("Check bandwidth rule.");
            debug.log("Download ratio: " + downloadRatio);

            if (isNaN(downloadRatio)) {
                newIdx = -1;
            } else if (downloadRatio < 1.0) {
                if (metrics.bitrateIndex > 0) {
                    switchRatio = metrics.getBitrateForIndex(metrics.bitrateIndex - 1) / metrics.getBitrateForIndex(metrics.bitrateIndex);
                    if (downloadRatio < switchRatio) {
                        newIdx = 0;
                    } else {
                        newIdx = metrics.bitrateIndex - 1;
                    }
                }
            } else {
                if (metrics.bitrateIndex < metrics.maxBitrateIndex) {
                    switchRatio = metrics.getBitrateForIndex(metrics.bitrateIndex + 1) / metrics.getBitrateForIndex(metrics.bitrateIndex);
                    if (downloadRatio >= switchRatio) {
                        if (downloadRatio > 1000.0) {
                            newIdx = metrics.maxBitrateIndex - 1;
                        }
                        else if (downloadRatio > 100.0) {
                            newIdx = metrics.bitrateIndex + 1;
                        }
                        else {
                            while ((newIdx += 1) < metrics.maxBitrateIndex + 1) {
                                switchRatio = metrics.getBitrateForIndex(newIdx) / metrics.getBitrateForIndex(metrics.bitrateIndex);
                                if (downloadRatio < switchRatio) {
                                    break;
                                }
                            }
                            newIdx -= 1;
                        }
                    }
                }
            }

            debug.log("Proposed index: " + newIdx);
            return newIdx;
        }
    };

    return Constr;
}());