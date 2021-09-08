/**
 * @file WMS
 * @author zhongziyan
 */

import OlSourceOSM from 'ol/source/OSM';
import React, {useRef, useEffect} from 'react';
import {Map, View} from 'ol';
import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import {get as getProjection, getTransform} from 'ol/proj';
import {applyTransform, getCenter} from 'ol/extent';
import TileWMS from 'ol/source/TileWMS';
import proj4 from 'proj4';
import {transformExtent} from 'ol/proj';
import {register} from 'ol/proj/proj4';

const Wms = props => {
    const {params = {}} = props;

    const srs = params.srs || 'EPSG:3857';

    let map = new Map({
        target: null,
        layers: [
            new TileLayer({
                source: new OlSourceOSM(),
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
        map.getView().setZoom(10);
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

    const setWmsTile = () => {
        // const wmsLayer = {
        //     extent: transformExtent([-126, 24, -66, 50], 'EPSG:4326', 'EPSG:3857'),
        //     source: new TileWMS({
        //       attributions: ['Iowa State University'],
        //       url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi',
        //       params: {'LAYERS': 'nexrad-n0r-wmst'},
        //     }),
        // };
        let wmsLayer = {
            source: new TileWMS({
                url: params.url,
                params: {
                    FORMAT: 'image/png',
                    VERSION: params.version || '1.1.1',
                    STYLES: params.style || '',
                    LAYERS: params.layer,
                    TRANSPARENT: true,
                    exceptions: 'application/vnd.ogc.se_inimage',
                    WIDTH: 512,
                    HEIGHT: 512,
                },
                serverType: 'geoserver',
                projection: srs,
            }),
        };
        if (params.bbox) {
            wmsLayer.extent = params.bbox;
        }
        map.addLayer(new TileLayer(wmsLayer));
    }

    useEffect(() => {
        if (!map) return;
        if (srs && srs !== 'EPSG:3857') {
            search(srs.replace('EPSG:', ''));
        }
        setWmsTile();
    }, [map, srs]);

    return <div id="map" style={{width: '100%', height: '100vh'}} ref={mapElement}></div>;
};

export default Wms;
