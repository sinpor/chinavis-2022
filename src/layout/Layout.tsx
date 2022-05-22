import React, { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import zhCN from "antd/lib/locale/zh_CN";
import { ConfigProvider, Menu, Layout, MenuProps } from "antd";
import { ItemType } from "antd/lib/menu/hooks/useItems";
const { Header, Content } = Layout;
export const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const items: MenuProps["items"] = [
        { label: "页面1", key: "/" }, // 菜单项务必填写 key
        { label: "页面2", key: "/page2" },
    ];

    const navigate = useNavigate();
    const location = useLocation();
    const [activeKey, setActiveKey] = useState("/");

    useEffect(() => {
        setActiveKey(location.pathname);
        console.log(location);
    }, [location]);

    function handleClick(e: ItemType) {
        navigate(e?.key as string);
    }

    return (
        <ConfigProvider locale={zhCN}>
            <Layout>
                <Header className="!bg-white">
                    <div className="float-left w-8  bg-gray-200 px-2">冲</div>
                    <Menu
                        activeKey={activeKey}
                        theme="light"
                        mode="horizontal"
                        items={items}
                        onClick={handleClick}
                    />
                </Header>
                <Content className="m-6">
                    <div className="rounded-xl p-6 bg-white min-h-80vh">
                        {children}
                    </div>
                </Content>
            </Layout>
        </ConfigProvider>
    );
};
