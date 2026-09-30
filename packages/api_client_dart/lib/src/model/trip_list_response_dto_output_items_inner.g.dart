// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_DRAFT =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('DRAFT');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_OPEN_FOR_SALE =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('OPEN_FOR_SALE');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_SOLD_OUT =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('SOLD_OUT');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_LOCKED =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('LOCKED');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_BOARDING =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('BOARDING');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_DEPARTED =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('DEPARTED');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_IN_PROGRESS =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('IN_PROGRESS');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_COMPLETED =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('COMPLETED');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_CANCELLED =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('CANCELLED');
const TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnum_INCIDENT =
    const TripListResponseDtoOutputItemsInnerStatusEnum._('INCIDENT');

TripListResponseDtoOutputItemsInnerStatusEnum
    _$tripListResponseDtoOutputItemsInnerStatusEnumValueOf(String name) {
  switch (name) {
    case 'DRAFT':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_DRAFT;
    case 'OPEN_FOR_SALE':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_OPEN_FOR_SALE;
    case 'SOLD_OUT':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_SOLD_OUT;
    case 'LOCKED':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_LOCKED;
    case 'BOARDING':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_BOARDING;
    case 'DEPARTED':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_DEPARTED;
    case 'IN_PROGRESS':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_IN_PROGRESS;
    case 'COMPLETED':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_COMPLETED;
    case 'CANCELLED':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_CANCELLED;
    case 'INCIDENT':
      return _$tripListResponseDtoOutputItemsInnerStatusEnum_INCIDENT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<TripListResponseDtoOutputItemsInnerStatusEnum>
    _$tripListResponseDtoOutputItemsInnerStatusEnumValues = BuiltSet<
        TripListResponseDtoOutputItemsInnerStatusEnum>(const <TripListResponseDtoOutputItemsInnerStatusEnum>[
  _$tripListResponseDtoOutputItemsInnerStatusEnum_DRAFT,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_OPEN_FOR_SALE,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_SOLD_OUT,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_LOCKED,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_BOARDING,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_DEPARTED,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_IN_PROGRESS,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_COMPLETED,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_CANCELLED,
  _$tripListResponseDtoOutputItemsInnerStatusEnum_INCIDENT,
]);

Serializer<TripListResponseDtoOutputItemsInnerStatusEnum>
    _$tripListResponseDtoOutputItemsInnerStatusEnumSerializer =
    _$TripListResponseDtoOutputItemsInnerStatusEnumSerializer();

class _$TripListResponseDtoOutputItemsInnerStatusEnumSerializer
    implements
        PrimitiveSerializer<TripListResponseDtoOutputItemsInnerStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'DRAFT': 'DRAFT',
    'OPEN_FOR_SALE': 'OPEN_FOR_SALE',
    'SOLD_OUT': 'SOLD_OUT',
    'LOCKED': 'LOCKED',
    'BOARDING': 'BOARDING',
    'DEPARTED': 'DEPARTED',
    'IN_PROGRESS': 'IN_PROGRESS',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED',
    'INCIDENT': 'INCIDENT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'DRAFT': 'DRAFT',
    'OPEN_FOR_SALE': 'OPEN_FOR_SALE',
    'SOLD_OUT': 'SOLD_OUT',
    'LOCKED': 'LOCKED',
    'BOARDING': 'BOARDING',
    'DEPARTED': 'DEPARTED',
    'IN_PROGRESS': 'IN_PROGRESS',
    'COMPLETED': 'COMPLETED',
    'CANCELLED': 'CANCELLED',
    'INCIDENT': 'INCIDENT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    TripListResponseDtoOutputItemsInnerStatusEnum
  ];
  @override
  final String wireName = 'TripListResponseDtoOutputItemsInnerStatusEnum';

  @override
  Object serialize(Serializers serializers,
          TripListResponseDtoOutputItemsInnerStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  TripListResponseDtoOutputItemsInnerStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      TripListResponseDtoOutputItemsInnerStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$TripListResponseDtoOutputItemsInner
    extends TripListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String routeId;
  @override
  final String routeName;
  @override
  final String? vehicleId;
  @override
  final String? vehiclePlateNumber;
  @override
  final DateTime departureAt;
  @override
  final DateTime arrivalAt;
  @override
  final TripListResponseDtoOutputItemsInnerStatusEnum status;
  @override
  final int seatCount;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$TripListResponseDtoOutputItemsInner(
          [void Function(TripListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (TripListResponseDtoOutputItemsInnerBuilder()..update(updates))._build();

  _$TripListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.routeId,
      required this.routeName,
      this.vehicleId,
      this.vehiclePlateNumber,
      required this.departureAt,
      required this.arrivalAt,
      required this.status,
      required this.seatCount,
      required this.createdAt,
      required this.updatedAt})
      : super._();
  @override
  TripListResponseDtoOutputItemsInner rebuild(
          void Function(TripListResponseDtoOutputItemsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TripListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      TripListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TripListResponseDtoOutputItemsInner &&
        id == other.id &&
        routeId == other.routeId &&
        routeName == other.routeName &&
        vehicleId == other.vehicleId &&
        vehiclePlateNumber == other.vehiclePlateNumber &&
        departureAt == other.departureAt &&
        arrivalAt == other.arrivalAt &&
        status == other.status &&
        seatCount == other.seatCount &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, routeId.hashCode);
    _$hash = $jc(_$hash, routeName.hashCode);
    _$hash = $jc(_$hash, vehicleId.hashCode);
    _$hash = $jc(_$hash, vehiclePlateNumber.hashCode);
    _$hash = $jc(_$hash, departureAt.hashCode);
    _$hash = $jc(_$hash, arrivalAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, seatCount.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TripListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('routeId', routeId)
          ..add('routeName', routeName)
          ..add('vehicleId', vehicleId)
          ..add('vehiclePlateNumber', vehiclePlateNumber)
          ..add('departureAt', departureAt)
          ..add('arrivalAt', arrivalAt)
          ..add('status', status)
          ..add('seatCount', seatCount)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class TripListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<TripListResponseDtoOutputItemsInner,
            TripListResponseDtoOutputItemsInnerBuilder> {
  _$TripListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _routeId;
  String? get routeId => _$this._routeId;
  set routeId(String? routeId) => _$this._routeId = routeId;

  String? _routeName;
  String? get routeName => _$this._routeName;
  set routeName(String? routeName) => _$this._routeName = routeName;

  String? _vehicleId;
  String? get vehicleId => _$this._vehicleId;
  set vehicleId(String? vehicleId) => _$this._vehicleId = vehicleId;

  String? _vehiclePlateNumber;
  String? get vehiclePlateNumber => _$this._vehiclePlateNumber;
  set vehiclePlateNumber(String? vehiclePlateNumber) =>
      _$this._vehiclePlateNumber = vehiclePlateNumber;

  DateTime? _departureAt;
  DateTime? get departureAt => _$this._departureAt;
  set departureAt(DateTime? departureAt) => _$this._departureAt = departureAt;

  DateTime? _arrivalAt;
  DateTime? get arrivalAt => _$this._arrivalAt;
  set arrivalAt(DateTime? arrivalAt) => _$this._arrivalAt = arrivalAt;

  TripListResponseDtoOutputItemsInnerStatusEnum? _status;
  TripListResponseDtoOutputItemsInnerStatusEnum? get status => _$this._status;
  set status(TripListResponseDtoOutputItemsInnerStatusEnum? status) =>
      _$this._status = status;

  int? _seatCount;
  int? get seatCount => _$this._seatCount;
  set seatCount(int? seatCount) => _$this._seatCount = seatCount;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  TripListResponseDtoOutputItemsInnerBuilder() {
    TripListResponseDtoOutputItemsInner._defaults(this);
  }

  TripListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _routeId = $v.routeId;
      _routeName = $v.routeName;
      _vehicleId = $v.vehicleId;
      _vehiclePlateNumber = $v.vehiclePlateNumber;
      _departureAt = $v.departureAt;
      _arrivalAt = $v.arrivalAt;
      _status = $v.status;
      _seatCount = $v.seatCount;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TripListResponseDtoOutputItemsInner other) {
    _$v = other as _$TripListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(TripListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TripListResponseDtoOutputItemsInner build() => _build();

  _$TripListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$TripListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'TripListResponseDtoOutputItemsInner', 'id'),
          routeId: BuiltValueNullFieldError.checkNotNull(
              routeId, r'TripListResponseDtoOutputItemsInner', 'routeId'),
          routeName: BuiltValueNullFieldError.checkNotNull(
              routeName, r'TripListResponseDtoOutputItemsInner', 'routeName'),
          vehicleId: vehicleId,
          vehiclePlateNumber: vehiclePlateNumber,
          departureAt: BuiltValueNullFieldError.checkNotNull(departureAt,
              r'TripListResponseDtoOutputItemsInner', 'departureAt'),
          arrivalAt: BuiltValueNullFieldError.checkNotNull(
              arrivalAt, r'TripListResponseDtoOutputItemsInner', 'arrivalAt'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'TripListResponseDtoOutputItemsInner', 'status'),
          seatCount: BuiltValueNullFieldError.checkNotNull(
              seatCount, r'TripListResponseDtoOutputItemsInner', 'seatCount'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'TripListResponseDtoOutputItemsInner', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(
              updatedAt, r'TripListResponseDtoOutputItemsInner', 'updatedAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
