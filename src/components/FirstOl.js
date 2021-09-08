/**
 * @file Basic Map
 * @author zhongziyan
 */

import React, {useEffect, useRef} from 'react';
import {Map, View} from 'ol';
import {Tile as TileLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';

const FirstOl = props => {

    const mapElement = useRef(null);

    const layers = [
        new TileLayer({
            source: new OSM(), // 创建一个使用Open Street Map地图源的瓦片图层
        }),
    ];

    useEffect(() => {
        // 创建地图
        const mapObject = new Map({
            layers,
            // 设置显示地图的视图
            view: new View({
                projection: 'EPSG:3857',
                center: [0, 0], // 定义地图显示中心于经度0度，纬度0度处
                zoom: 2, // 并且定义地图显示层级为2
            }),
        });
        // 让id为map的div作为地图的容器
        mapObject.setTarget(mapElement.current);

        return () => mapObject.setTarget(undefined);
    }, []);

    return <div id="map" style={{width: '100%', height: '100vh'}} ref={mapElement} />;
};

export default FirstOl;
