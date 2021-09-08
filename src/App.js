import React, {useEffect, useState} from 'react';
import FirstOl from './components/FirstOl';
import MultiProjection from './components/MultiProjection';
import BaiduMap from './components/BaiduMap';
import Wms from './components/Wms';
import Wfs from './components/Wfs';
import Wmts from './components/Wmts';
import Mvts from './components/Mvts';

function App() {
    const [srs, setSrs] = useState('EPSG:3857');

    const handleQuery = (e) => {
        setSrs(e.target.value);
    };

    const epsgSelector = (
        <select id="epsg" onChange={handleQuery}>
            <option value="EPSG:3857">Spherical Mercator (EPSG:3857)</option>
            <option value="EPSG:4326">WGS 84 (EPSG:4326)</option>
            <option value="EPSG:27700">British National Grid (EPSG:27700)</option>
            <option value="EPSG:23032">ED50 / UTM zone 32N (EPSG:23032)</option>
            <option value="EPSG:2163">US National Atlas Equal Area (EPSG:2163)</option>
            <option value="EPSG:3413">NSIDC Polar Stereographic North (EPSG:3413)</option>
            <option value="EPSG:5479">RSRGD2000 / MSLC2000 (EPSG:5479)</option>
        </select>
    );

    return (
        <div>
            {/* <FirstOl /> */}
            {/* <>
                {epsgSelector}
                <MultiProjection srs={srs} />
            </> */}
            {/* <BaiduMap /> */}
            {/* <Wms /> */}
            {/* <Wms
                params={{
                    layer: 'tiger-ny',
                    srs: 'EPSG:4326',
                    url: 'http://localhost:8080/geoserver/wms',
                    bbox: [-74.047185, 40.679648, -73.907005, 40.882078],
                }}
            /> */}
            {/* <Wfs /> */}
            {/* <Wfs
                params={{
                    layer: 'sf:restricted',
                    srs: 'EPSG:26713',
                    url: 'http://localhost:8080/geoserver/sf/ows',
                    bbox: [591579.1858092896, 4916236.662227167, 599648.9251686076, 4925872.146218054],
                }}
            /> */}
            {/* <Wmts
                params={{
                    layer: 'tiger:tiger_roads',
                    srs: 'EPSG:4326',
                    url: 'http://localhost:8080/geoserver/gwc/service/wmts',
                    bbox: [-74.047185, 40.679648, -73.907005, 40.882078],
                }}
            /> */}
            {/* <Mvts /> */}
            <Mvts
                params={{
                    layer: 'spearfish',
                    srs: 'EPSG:4326',
                    url: 'http://localhost:8080/geoserver/gwc/service/wmts',
                    bbox: [-124.73099635161998, 24.955998512424216, -66.96999731919784, 49.37199789472331]
                }}
            />
        </div>
    );
}

export default App;
