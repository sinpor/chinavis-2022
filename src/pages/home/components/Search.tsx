import React, { useEffect, useState } from "react";
import { Input, Space } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { request } from "../../../utils/request/request";
import { eventBus } from "../../../utils/bus/bus";

const { Search } = Input;

const onSearch = (value: string) => {
    eventBus.emit("clue", value);
};

export const SearchId: React.FC = () => {
    return (
        <Space direction="vertical" className="w-full">
            <Search
                placeholder="请输入网络资产线索"
                onSearch={onSearch}
                style={{ width: "100%" }}
            />
        </Space>
    )

}