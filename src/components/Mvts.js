/**
 * @file MVTS
 * @author zhongziyan
 */

import React, {useEffect, useRef} from 'react';
import {Map, View} from 'ol';
import {applyTransform, getCenter} from 'ol/extent';
import MVT from 'ol/format/MVT';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import {Tile as TileLayer} from 'ol/layer';
import VectorTileLayer from 'ol/layer/VectorTile';
import {get as getProjection, getTransform} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import OSM from 'ol/source/OSM';
import VectorTileSource from 'ol/source/VectorTile';
import {optionsFromCapabilities} from 'ol/source/WMTS';
import 'ol/ol.css';
import proj4 from 'proj4';

// 生成mvts完整url
const getMVTSUrl = (layer, srs, baseUrl = '') => {
    const PARAMS = {
        REQUEST: 'GetTile',
        SERVICE: 'WMTS',
        VERSION: '1.0.0',
        LAYER: layer,
        STYLE: '',
        TILEMATRIX: `${srs}:{z}`,
        TILEMATRIXSET: srs,
        FORMAT: 'application/vnd.mapbox-vector-tile',
        TILECOL: '{x}',
        TILEROW: '{y}',
    };
    let url = `${baseUrl.replace('/platform', '').split('?')?.[0]}?`;
    for (const [key, value] of Object.entries(PARAMS)) {
        url = `${url}${key}=${value}&`;
    }
    return url.slice(0, -1);
};

const Mvts = (props) => {
    const {params = {}} = props;

    const srs = params.srs || 'EPSG:3857';

    let map = new Map({
        target: null,
        layers: [
            new TileLayer({
                source: new OSM(),
            }),
        ],
        view: new View({
            center: [0, 0],
            zoom: 2,
            projection: 'EPSG:3857',
        }),
    });

    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;

    useEffect(() => {
        map.setTarget(mapElement.current);
        return () => map.setTarget(undefined);
    }, [srs]);

    function setProjection(code, name, proj4def, bbox) {
        if (code === null || name === null || proj4def === null || bbox === null) {
            return;
        }

        const newProjCode = 'EPSG:' + code;
        proj4.defs(newProjCode, proj4def);
        register(proj4);
        const newProj = getProjection(newProjCode);
        const fromLonLat = getTransform('EPSG:4326', newProj);

        let worldExtent = [bbox[1], bbox[2], bbox[3], bbox[0]];
        newProj.setWorldExtent(worldExtent);

        // approximate calculation of projection extent,
        // checking if the world extent crosses the dateline
        if (bbox[1] > bbox[3]) {
            worldExtent = [bbox[1], bbox[2], bbox[3] + 360, bbox[0]];
        }
        const extent = applyTransform(worldExtent, fromLonLat, undefined, 8);
        newProj.setExtent(extent);
        const newView = new View({
            projection: newProj,
            center: getCenter(extent || [0, 0, 0, 0]),
        });
        map.setView(newView);
        newView.fit(extent);
        map.getView().setCenter(getCenter(params.bbox || [0, 0, 0, 0]));
        map.getView().setZoom(5);
    }

    // 通过epsg接口查询定义坐标所需参数
    function search(query) {
        fetch('https://epsg.io/?format=json&q=' + query)
            .then(function (response) {
                return response.json();
            })
            .then(function (json) {
                const results = json['results'];
                if (results && results.length > 0) {
                    for (let i = 0, ii = results.length; i < ii; i++) {
                        const result = results[i];
                        if (result) {
                            const code = result['code'];
                            const name = result['name'];
                            const proj4def = result['proj4'];
                            const bbox = result['bbox'];
                            if (
                                code &&
                                code.length > 0 &&
                                proj4def &&
                                proj4def.length > 0 &&
                                bbox &&
                                bbox.length === 4
                            ) {
                                setProjection(code, name, proj4def, bbox);
                                return;
                            }
                        }
                    }
                }
                setProjection(null, null, null, null);
            });
    }

    const setMvtsTile = () => {
        // https://openlayers.org/en/latest/examples/mapbox-vector-tiles.html
        // const mvtsLayer = new VectorTileLayer({
        //     declutter: true,
        //     source: new VectorTileSource({
        //         attributions:
        //             '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
        //             '© <a href="https://www.openstreetmap.org/copyright">' +
        //             'OpenStreetMap contributors</a>',
        //         format: new MVT(),
        //         url:
        //             'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
        //             '{z}/{x}/{y}.vector.pbf?access_token=' +
        //             'pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2pzbmg0Nmk5MGF5NzQzbzRnbDNoeHJrbiJ9.7_-_gL8ur7ZtEiNwRfCy7Q'
        //     }),
        // });
        // map.addLayer(mvtsLayer);

        const parser = new WMTSCapabilities();
        fetch(params.url + '?service=WMTS&version=1.0.0&request=GetCapabilities')
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                const result = parser.read(text);
                const options = optionsFromCapabilities(result, {
                    layer: params.layer,
                    matrixSet: params.srs,
                });
                const {layer, srs, url} = params;
                const mvtsUrl = getMVTSUrl(layer, srs, url);
                const mvtsLayer = new VectorTileLayer({
                    source: new VectorTileSource({
                        format: new MVT(),
                        url: mvtsUrl,
                        projection: options.projection,
                        tileGrid: options.tileGrid,
                        wrapX: true,
                    }),
                });
                map.addLayer(mvtsLayer);
            });
    };

    useEffect(() => {
        if (!map) return;
        if (srs && srs !== 'EPSG:3857') {
            search(srs.replace('EPSG:', ''));
        }
        setMvtsTile();
    }, [map, srs]);

    return <div id="map" style={{width: '100%', height: '100vh'}} ref={mapElement}></div>;
};

export default Mvts;
