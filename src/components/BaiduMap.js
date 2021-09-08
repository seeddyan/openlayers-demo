/**
 * @file Baidu Map
 * @author zhongziyan
 */

import React, {useEffect, useRef} from 'react';
import {Map, View} from 'ol';
import {Tile as TileLayer} from 'ol/layer';
import OSM from 'ol/source/OSM';
import {addCoordinateTransforms, addProjection, Projection} from 'ol/proj';
import {XYZ} from 'ol/source';
import TileGrid from 'ol/tilegrid/TileGrid';
import 'ol/ol.css';
import projzh from 'projzh';

// 在OpenLayers中，默认使用的瓦片地图的坐标系是如何定义的？
// 经分析可知，OpenLayers的瓦片坐标系的原点在左上角，向上为y轴正方向，向右为x轴正方向。
// 理解这一点非常重要，因为并不是所有在线的瓦片地图都是采用这样的坐标系。
// 用OpenLayers 加载它们的时候，如果坐标系不同，计算出来的瓦片地址就获取不到对应的瓦片，
// 为解决这个问题，我们必须要先对瓦片坐标进行转换。

/**
 * 百度地图坐标转换
 */
const bd09Extent = [-20037726.37, -12474104.17, 20037726.37, 12474104.17];
const baiduMercator = new Projection({
    code: 'baidu',
    extent: bd09Extent,
    units: 'm',
});
addProjection(baiduMercator);
// source, destination, forward, inverse
addCoordinateTransforms('EPSG:4326', baiduMercator, projzh.ll2bmerc, projzh.bmerc2ll);
addCoordinateTransforms('EPSG:3857', baiduMercator, projzh.smerc2bmerc, projzh.bmerc2smerc);

// 初始化分辨率数组
const bmercResolutions = new Array(19);
for (let i = 0; i < 19; ++i) {
    bmercResolutions[i] = Math.pow(2, 18 - i);
}

const baiduSource = new XYZ({
    projection: 'baidu',
    wrapX: true,
    url: 'http://maponline{0-3}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20210408',
    tileGrid: new TileGrid({
        minZoom: 3,
        resolutions: bmercResolutions,
        origin: [0, 0],
        extent: bd09Extent,
    }),
});
const xyzTileUrlFunction = baiduSource.getTileUrlFunction();
const tmsTileUrlFunction = function ([z, x, y]) {
    // y轴取反，-1目的是为了从0开始计数
    return xyzTileUrlFunction([z, x, -y - 1]);
};
// 这是一个获取瓦片url的函数，如果自定义这个函数，就可以实现不同坐标系之间的转换
baiduSource.setTileUrlFunction(tmsTileUrlFunction);

const BaiduMap = props => {

    const mapElement = useRef(null);

    const layers = [
        new TileLayer({
            // source: new OSM(),
            source: new XYZ({
                // 高德地图
                url:'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
            }),
            // source: baiduSource,
        }),
    ];

    useEffect(() => {
        const mapObject = new Map({
            layers,
            view: new View({
                projection: 'EPSG:3857',
                center: [0, 0],
                zoom: 2,
            }),
        });
        mapObject.setTarget(mapElement.current);
        return () => mapObject.setTarget(undefined);
    }, []);

    return <div id="map" style={{width: '100%', height: '100vh'}} ref={mapElement} />;
};

export default BaiduMap;
