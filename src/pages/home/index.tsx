import React from "react";
import { Force } from "./components/Force";

export const Home: React.FC = () => {
    return (
        <div className="flex h-full">
            <div className="w-1/4 border mx-2">
                <div> 搜索</div>
                <div className="m-2">列表</div>
            </div>
            <div className="flex-1 border mx-2">
                <div className="m-2">操作</div>
                <div className="m-2 border">
                    <Force />
                </div>
            </div>
            <div className="w-1/4 border mx-2">
                <div className="m-2">操作</div>
                <div className="m-2">操作</div>
            </div>
        </div>
    );
};
