// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'operator_stop_point_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum
    _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION =
    const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum._(
        'BUS_STATION');
const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum
    _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_OFFICE =
    const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum._('OFFICE');
const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum
    _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_REST_STOP =
    const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum._(
        'REST_STOP');
const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum
    _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT =
    const OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum._(
        'PICKUP_POINT');

OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum
    _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnumValueOf(
        String name) {
  switch (name) {
    case 'BUS_STATION':
      return _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION;
    case 'OFFICE':
      return _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_OFFICE;
    case 'REST_STOP':
      return _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_REST_STOP;
    case 'PICKUP_POINT':
      return _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum>
    _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnumValues = BuiltSet<
        OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum>(const <OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum>[
  _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_BUS_STATION,
  _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_OFFICE,
  _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_REST_STOP,
  _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnum_PICKUP_POINT,
]);

const OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum
    _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnum_ACTIVE =
    const OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum._(
        'ACTIVE');
const OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum
    _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnum_INACTIVE =
    const OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum._(
        'INACTIVE');

OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum
    _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnumValueOf(
        String name) {
  switch (name) {
    case 'ACTIVE':
      return _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum>
    _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnumValues =
    BuiltSet<
        OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum>(const <OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum>[
  _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnum_ACTIVE,
  _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnum_INACTIVE,
]);

Serializer<OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum>
    _$operatorStopPointListResponseDtoOutputItemsInnerTypeEnumSerializer =
    _$OperatorStopPointListResponseDtoOutputItemsInnerTypeEnumSerializer();
Serializer<OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum>
    _$operatorStopPointListResponseDtoOutputItemsInnerStatusEnumSerializer =
    _$OperatorStopPointListResponseDtoOutputItemsInnerStatusEnumSerializer();

class _$OperatorStopPointListResponseDtoOutputItemsInnerTypeEnumSerializer
    implements
        PrimitiveSerializer<
            OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'BUS_STATION': 'BUS_STATION',
    'OFFICE': 'OFFICE',
    'REST_STOP': 'REST_STOP',
    'PICKUP_POINT': 'PICKUP_POINT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum
  ];
  @override
  final String wireName =
      'OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum';

  @override
  Object serialize(Serializers serializers,
          OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$OperatorStopPointListResponseDtoOutputItemsInnerStatusEnumSerializer
    implements
        PrimitiveSerializer<
            OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum
  ];
  @override
  final String wireName =
      'OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum';

  @override
  Object serialize(Serializers serializers,
          OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$OperatorStopPointListResponseDtoOutputItemsInner
    extends OperatorStopPointListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String name;
  @override
  final OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum type;
  @override
  final String address;
  @override
  final String provinceId;
  @override
  final String wardId;
  @override
  final num latitude;
  @override
  final num longitude;
  @override
  final String? description;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum status;

  factory _$OperatorStopPointListResponseDtoOutputItemsInner(
          [void Function(
                  OperatorStopPointListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (OperatorStopPointListResponseDtoOutputItemsInnerBuilder()
            ..update(updates))
          ._build();

  _$OperatorStopPointListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.name,
      required this.type,
      required this.address,
      required this.provinceId,
      required this.wardId,
      required this.latitude,
      required this.longitude,
      this.description,
      required this.createdAt,
      required this.updatedAt,
      required this.status})
      : super._();
  @override
  OperatorStopPointListResponseDtoOutputItemsInner rebuild(
          void Function(OperatorStopPointListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OperatorStopPointListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      OperatorStopPointListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OperatorStopPointListResponseDtoOutputItemsInner &&
        id == other.id &&
        name == other.name &&
        type == other.type &&
        address == other.address &&
        provinceId == other.provinceId &&
        wardId == other.wardId &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        description == other.description &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        status == other.status;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, provinceId.hashCode);
    _$hash = $jc(_$hash, wardId.hashCode);
    _$hash = $jc(_$hash, latitude.hashCode);
    _$hash = $jc(_$hash, longitude.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'OperatorStopPointListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('name', name)
          ..add('type', type)
          ..add('address', address)
          ..add('provinceId', provinceId)
          ..add('wardId', wardId)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('description', description)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('status', status))
        .toString();
  }
}

class OperatorStopPointListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<OperatorStopPointListResponseDtoOutputItemsInner,
            OperatorStopPointListResponseDtoOutputItemsInnerBuilder> {
  _$OperatorStopPointListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum? _type;
  OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum? get type =>
      _$this._type;
  set type(OperatorStopPointListResponseDtoOutputItemsInnerTypeEnum? type) =>
      _$this._type = type;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  String? _provinceId;
  String? get provinceId => _$this._provinceId;
  set provinceId(String? provinceId) => _$this._provinceId = provinceId;

  String? _wardId;
  String? get wardId => _$this._wardId;
  set wardId(String? wardId) => _$this._wardId = wardId;

  num? _latitude;
  num? get latitude => _$this._latitude;
  set latitude(num? latitude) => _$this._latitude = latitude;

  num? _longitude;
  num? get longitude => _$this._longitude;
  set longitude(num? longitude) => _$this._longitude = longitude;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum? _status;
  OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum? get status =>
      _$this._status;
  set status(
          OperatorStopPointListResponseDtoOutputItemsInnerStatusEnum? status) =>
      _$this._status = status;

  OperatorStopPointListResponseDtoOutputItemsInnerBuilder() {
    OperatorStopPointListResponseDtoOutputItemsInner._defaults(this);
  }

  OperatorStopPointListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _type = $v.type;
      _address = $v.address;
      _provinceId = $v.provinceId;
      _wardId = $v.wardId;
      _latitude = $v.latitude;
      _longitude = $v.longitude;
      _description = $v.description;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OperatorStopPointListResponseDtoOutputItemsInner other) {
    _$v = other as _$OperatorStopPointListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(OperatorStopPointListResponseDtoOutputItemsInnerBuilder)?
          updates) {
    if (updates != null) updates(this);
  }

  @override
  OperatorStopPointListResponseDtoOutputItemsInner build() => _build();

  _$OperatorStopPointListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$OperatorStopPointListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'OperatorStopPointListResponseDtoOutputItemsInner', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(name,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'name'),
          type: BuiltValueNullFieldError.checkNotNull(type,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'type'),
          address: BuiltValueNullFieldError.checkNotNull(address,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'address'),
          provinceId: BuiltValueNullFieldError.checkNotNull(
              provinceId,
              r'OperatorStopPointListResponseDtoOutputItemsInner',
              'provinceId'),
          wardId: BuiltValueNullFieldError.checkNotNull(wardId,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'wardId'),
          latitude: BuiltValueNullFieldError.checkNotNull(latitude,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'latitude'),
          longitude: BuiltValueNullFieldError.checkNotNull(longitude,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'longitude'),
          description: description,
          createdAt: BuiltValueNullFieldError.checkNotNull(createdAt,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(updatedAt,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'updatedAt'),
          status: BuiltValueNullFieldError.checkNotNull(status,
              r'OperatorStopPointListResponseDtoOutputItemsInner', 'status'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
